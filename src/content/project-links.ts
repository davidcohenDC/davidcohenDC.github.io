// The records a project points to besides its repository, by the
// repository's full name (content/sources.ts). A module shows each one the
// same way it shows GitHub: a label and a link, nothing specific to it. A
// repository with no entry here shows GitHub alone.
export type ProjectLink = { label: string; href: string }

export const projectLinks: Record<string, readonly ProjectLink[]> = {
  'Scala-Robotics-Simulator/scala-robotics-simulator': [
    // The phototaxis notebook, at the commit its reported results come from.
    {
      label: 'Experiment notebook',
      href: 'https://github.com/Scala-Robotics-Simulator/scala-robotics-simulator/blob/2c1e45d10a90cead1ae3348a08cab8839e9e2759/python/src/notebooks/report/phototaxis.ipynb'
    }
  ]
}
