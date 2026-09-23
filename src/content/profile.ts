// Public facts from the current CV. Feeds the hero, the footer, the CV and
// the JSON-LD metadata.
export const profile = {
  name: 'David Cohen',
  email: 'david@davidcohen.it',
  origin: 'https://davidcohendc.github.io',
  github: 'https://github.com/davidcohenDC',
  linkedin: 'https://www.linkedin.com/in/david-cohen96/',
  description:
    'M.Sc. Computer Science and Engineering student at the University of Bologna, four years of professional back-end experience, co-author of a peer-reviewed Neural Networks article.',
  jobTitle: 'M.Sc. student in Computer Science and Engineering',
  // Summarises the projects below it, so a reader can check it by scrolling.
  builds:
    'Robotics simulation, autonomous systems and developer tooling, in Scala and Python.',
  academicLine: ['University of Bologna', 'Expected March 2027'],
  university: { name: 'University of Bologna', url: 'https://www.unibo.it/' },
  interests: [
    'Reinforcement learning',
    'Distributed systems',
    'Software architecture'
  ]
}

export const education = [
  {
    degree: 'M.Sc. Computer Science and Engineering',
    dates: 'September 2022 – in progress; expected March 2027',
    institution: 'University of Bologna · Cesena',
    detail:
      'Weighted average 28.5/30, including 30 e lode in Machine Learning and Smart Vehicular Systems.'
  },
  {
    degree: 'B.Sc. Computer Science and Engineering',
    dates: 'September 2018 – December 2022',
    institution: 'University of Bologna · Cesena',
    detail:
      'Computer Engineering track. Thesis in natural language processing and decoding strategies for abstractive summarization.'
  }
]

export const lastUpdated = { iso: '2026-09-22', label: 'September 2026' }

// Asserted by tests/portfolio.spec.ts.
export const independence = 'No analytics, no cookies, no third-party requests.'
