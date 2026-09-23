// The interface's words on the static documents — the CV and the 404 — which
// ship no framework, so nothing here weighs on the portfolio page. The words
// both kinds of page share are in copy.ts.
export const documentCopy = {
  sections: {
    publication: 'Publication',
    education: 'Education',
    experience: 'Experience',
    projects: 'Selected projects',
    projectsNav: 'Projects',
    more: 'Further projects',
    moreNav: 'More',
    skills: 'Skills & languages',
    skillsNav: 'Skills'
  },

  landmarks: {
    cvSections: 'CV sections',
    skipToCv: 'Skip to CV',
    home: 'dc. David Cohen, portfolio'
  },

  actions: {
    portfolio: 'Portfolio',
    download: 'Download',
    print: 'Print',
    codeAndDataset: 'Code and dataset'
  },

  hints: {
    pdf: 'PDF, two pages',
    downloadCv: 'Download the CV, PDF, two pages'
  },

  lists: {
    languages: 'Languages',
    certification: 'Certification'
  },

  labels: {
    updated: 'Updated',
    openAccess: 'Open access'
  },

  notFound: {
    code: 'Error 404',
    title: 'Page not found',
    text: 'This address is not part of the site.'
  }
} as const
