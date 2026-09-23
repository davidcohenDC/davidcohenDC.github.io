// The words the interface says about itself: the names of sections, links
// and controls, the landmarks, and what a screen reader hears. What a project
// or a paper *is* comes from its record, and what David claims comes from his
// documents; this is only the furniture's labels.
//
// No component writes a word of its own. A label changes here, once, for
// every page that shows it. Two files, split by who reads them: this one is
// in the portfolio's JavaScript, so it holds only what that page says;
// content/document-copy.ts holds what only the CV and the 404 say, and
// costs the page nothing.
export const copy = {
  sections: {
    work: 'Projects',
    publication: 'Publication',
    cv: 'CV',
    cvTitle: 'Curriculum vitae'
  },

  landmarks: {
    main: 'Main navigation',
    skipToContent: 'Skip to content',
    home: 'dc. David Cohen, home'
  },

  actions: {
    viewCv: 'View CV',
    cv: 'CV',
    backToTop: 'Back to top',
    github: 'GitHub',
    linkedin: 'LinkedIn',
    allRepositories: 'All repositories',
    copyEmail: 'Copy the e-mail address',
    showAll: 'Show all',
    cite: 'Cite',
    copyCitation: 'Copy the citation as BibTeX',
    toDark: 'Switch to dark theme',
    toLight: 'Switch to light theme'
  },

  // What completes a link's name for a screen reader.
  hints: {
    cvFormats: 'HTML, with the two-page PDF inside',
    sendEmail: 'Send an email'
  },

  // The names of lists, read before their items.
  lists: {
    technologies: 'Technologies',
    aboutRecord: 'About this record',
    moreOnGitHub: 'Also on GitHub'
  },

  labels: {
    copied: 'Copied',
    taggedWith: 'Tagged',
    matching: (count: number) =>
      `${count} ${count === 1 ? 'project' : 'projects'}`,
    more: (count: number) => `${count} more`,
    portrait: 'Drawing of David Cohen',
    clipOf: (title: string) => `Recording of ${title} running`,
    toPause: 'activate to pause',
    toPlayOrPause: 'activate to play or pause'
  }
} as const
