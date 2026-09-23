// Responsive image manifest. `npm run images` renders every width listed here
// from assets-source/ into public/; components read the same entries, so the
// markup and the files cannot drift apart.
export type ResponsiveImage = {
  source: string
  out: string
  widths: readonly number[]
  // Intrinsic size of the largest variant, for the width/height attributes.
  width: number
  height: number
  // Optional crop of the source, in source pixels.
  crop?: { left: number; top: number; width: number; height: number }
  // WebP quality, where 80 is not enough: line art is all edges.
  quality?: number
}

export const images = {
  paper: {
    source: 'assets-source/research/prism-first-page.webp',
    out: 'research/prism-first-page',
    widths: [280, 560, 840],
    width: 840,
    height: 1119
  },
  srs: {
    source: 'assets-source/projects/srs-run.png',
    out: 'projects/srs',
    widths: [480, 768, 1152, 1600],
    width: 1600,
    height: 900
  },
  lecturize: {
    source: 'assets-source/projects/lecturize.png',
    out: 'projects/lecturize',
    widths: [480, 768, 1152, 1536],
    width: 1536,
    height: 864
  },
  proof: {
    source: 'assets-source/projects/clean-architecture-proof.png',
    out: 'projects/clean-architecture-proof',
    widths: [480, 768, 1152, 1536],
    width: 1536,
    height: 864
  },
  argos: {
    source: 'assets-source/projects/argos-swarm.png',
    out: 'projects/argos-swarm',
    // 768 is the poster width: twice the 24rem the cover is capped at.
    widths: [480, 768, 960],
    width: 960,
    height: 540
  },
  parking: {
    source: 'assets-source/projects/parking-frame.png',
    out: 'projects/parking',
    widths: [512],
    width: 512,
    height: 300
  }
} as const satisfies Record<string, ResponsiveImage>

export type ImageKey = keyof typeof images

export function imagePath(image: ResponsiveImage, width: number) {
  return `/${image.out}-${width}.webp`
}

// Attributes for an <img>: the largest variant as fallback, every width in
// srcset, and the layout-dependent `sizes` supplied by the component.
export function imageProps(key: ImageKey, sizes: string) {
  const image = images[key]
  return {
    src: imagePath(image, image.widths[image.widths.length - 1]),
    srcSet: image.widths
      .map((width) => `${imagePath(image, width)} ${width}w`)
      .join(', '),
    sizes,
    width: image.width,
    height: image.height
  }
}
