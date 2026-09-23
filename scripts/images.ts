// Renders the responsive WebP variants declared in src/media/images.ts.
import { mkdirSync, readdirSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import sharp from 'sharp'
import { images, imagePath, type ResponsiveImage } from '@/media/images'

// Photographs and screenshots take 80 without complaint. Line art does not:
// a drawing is all edges, and 80 softens every one of them. The manifest can
// ask for more where it matters.
const QUALITY = 80

for (const image of Object.values<ResponsiveImage>(images)) {
  const outputs = new Set(
    image.widths.map((width) => join('public', imagePath(image, width)))
  )
  const directory = dirname([...outputs][0])
  mkdirSync(directory, { recursive: true })
  // Remove stale variants so public/ only holds what the manifest lists.
  for (const name of readdirSync(directory)) {
    const file = join(directory, name)
    const base = image.out.split('/').pop() + '-'
    if (name.startsWith(base) && name.endsWith('.webp') && !outputs.has(file))
      unlinkSync(file)
  }
  const source = image.crop
    ? sharp(image.source).extract(image.crop)
    : sharp(image.source)
  for (const width of image.widths) {
    const file = join('public', imagePath(image, width))
    const info = await source
      .clone()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: image.quality ?? QUALITY })
      .toFile(file)
    if (width === image.width && info.height !== image.height)
      throw new Error(
        `${image.out}: manifest says ${image.width}×${image.height}, rendered ${info.width}×${info.height}`
      )
    console.log(`${file} ${info.width}×${info.height} ${info.size} bytes`)
  }
}
