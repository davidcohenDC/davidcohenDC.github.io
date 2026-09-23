import type { ImageKey } from './images'

// Which files illustrate which record. Files only, never words: a repository
// or paper with no entry here still renders, with a generic cover.

export type Clip = { src: string }

export type RepositoryMedia = { cover: ImageKey; clip?: Clip }

// Keyed by the repository's full name, as listed in content/sources.ts.
export const repositoryMedia: Record<string, RepositoryMedia> = {
  'Scala-Robotics-Simulator/scala-robotics-simulator': {
    cover: 'srs',
    clip: { src: '/media/srs-run.mp4' }
  },
  'davidcohenDC/lecturize': { cover: 'lecturize' },
  'davidcohenDC/python-clean-architecture-template': { cover: 'proof' },
  'davidcohenDC/s-parking': {
    cover: 'parking',
    clip: { src: '/media/s-parking-demo.mp4' }
  },
  'davidcohenDC/argos-swarm-robotics': {
    cover: 'argos',
    clip: { src: '/media/argos-swarm.mp4' }
  }
}

// Keyed by DOI: the first page of the paper.
export const paperMedia: Record<string, ImageKey> = {
  '10.1016/j.neunet.2025.108249': 'paper'
}
