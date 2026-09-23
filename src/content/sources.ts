// The only list to edit to change what the page shows. Everything a visitor
// reads about these comes from GitHub, Crossref, OpenAlex and PyPI through
// `npm run sync`; nothing about a single project is written in this repo.
export const sources = {
  owner: 'davidcohenDC',
  // Pinned repositories come first (with a token), then this order.
  repositories: [
    'Scala-Robotics-Simulator/scala-robotics-simulator',
    'davidcohenDC/lecturize',
    'davidcohenDC/python-clean-architecture-template',
    'davidcohenDC/s-parking',
    'davidcohenDC/argos-swarm-robotics',
    'Factory-Manager/factory-manager',
    'davidcohenDC/distributed-cooperative-pixel-art',
    'davidcohenDC/code-metrics-analyzer',
    'davidcohenDC/BigDataProject',
    'davidcohenDC/pps-labs',
    'davidcohenDC/machine-learning-labs'
  ],
  // How many repositories get a module; the rest are one line each. Only a
  // repository with a picture can have one (data/projects.ts). Even, so the
  // grid of two closes on a full row.
  featured: 4,
  // Papers by DOI, with the repository holding their code when public and the
  // institutional record when there is one. Both are links to records that
  // somebody else keeps, which is the only kind of address written here.
  papers: [
    {
      doi: '10.1016/j.neunet.2025.108249',
      code: 'https://github.com/disi-unibo-nlp/prism',
      archive: {
        href: 'https://cris.unibo.it/handle/11585/1027360',
        label: 'University of Bologna archive'
      }
    }
  ]
} as const
