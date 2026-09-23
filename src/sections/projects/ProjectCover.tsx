import { copy } from '@/content/copy'
import type { Project } from '@/domain/project'
import { imagePath, imageProps, images } from '@/media/images'
import GeneratedCover from './GeneratedCover'
import { topicIcon } from './topic-icon'

// The cover is a module's width: the column on a phone, half of it from a
// tablet up, which is 448px in the 960px column.
const coverSizes =
  '(max-width: 760px) calc(100vw - 40px), (max-width: 1000px) calc(50vw - 64px), 448px'

// Twice the cap, which is what a high-density screen asks for and no more —
// but only among the widths this picture was actually rendered at. Asking for
// a width the manifest does not list gets a 404, and a `poster` that 404s is
// a silent one: the video shows a blank frame and the page downloads the
// server's fallback page instead of a picture.
const POSTER_CAP = 768

function posterWidth(widths: readonly number[]) {
  return (
    widths.find((width) => width >= POSTER_CAP) ?? widths[widths.length - 1]
  )
}

// The shape every cover takes, whatever fills it. Split in two because the
// generated cover sets its own display: a picture is a block, that one is a
// grid, and Tailwind orders display utilities by its own rules, not by the
// order they appear in the attribute.
const frame =
  'aspect-16/9 w-full bg-wash md:aspect-16/10 ' +
  'dark:[filter:brightness(0.82)_saturate(0.85)]'

const media = `block object-cover ${frame}`

// Any repository gets a cover: its bound picture or clip, or one drawn from
// its own topics and name until a picture is added (media/bindings.ts).
export default function ProjectCover({ project }: { project: Project }) {
  if (!project.cover)
    return (
      <GeneratedCover
        project={project}
        icon={topicIcon(project.topics)}
        className={frame}
      />
    )
  if (!project.clip)
    return (
      <img
        {...imageProps(project.cover, coverSizes)}
        className={`${media} transition-[filter] duration-300`}
        alt=""
        loading="lazy"
        decoding="async"
      />
    )
  // Nothing is fetched before the clip plays (see use-clips).
  //
  // The poster is a different matter: it is painted immediately, and on the
  // first project it is what Largest Contentful Paint measures. A <video>
  // poster takes no srcset, so the width is chosen here — and the cover is
  // capped at 24rem, so 768px covers it at twice the pixel density. The
  // largest variant was four times the size it is ever displayed at.
  const poster = images[project.cover]
  return (
    <video
      className={media}
      controls
      muted
      playsInline
      preload="none"
      poster={imagePath(poster, posterWidth(poster.widths))}
      width={poster.width}
      height={poster.height}
      aria-label={copy.labels.clipOf(project.title)}
    >
      <source src={project.clip.src} type="video/mp4" />
    </video>
  )
}
