// Conventional commits: the type says at a glance what a change is, and the
// history stays readable however it is cut. The types are the ones this
// repository actually uses; a longer list is a longer decision at commit time
// for no gain.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // something a visitor can see
        'fix', // something that was wrong
        'refactor', // the same page, differently built
        'perf', // faster or smaller, with the number in the body
        'docs', // README, docs/, comments
        'test', // a test, or a threshold
        'build', // Vite, Tailwind, dependencies
        'ci', // workflows
        'chore' // everything else, and as rare as possible
      ]
    ],
    // A subject is a sentence without its full stop: "the menu marks Contact
    // when you reach the bottom", not "Fixed menu bug."
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 72],
    'body-max-line-length': [2, 'always', 76]
  }
}
