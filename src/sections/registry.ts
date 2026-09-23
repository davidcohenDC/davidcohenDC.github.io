import { copy } from '@/content/copy'
import type { SectionDef } from '@/ui/Section'

// The blocks of the page, in menu order. Adding a block is one entry here and
// one component in its own folder.
export const sections = {
  work: {
    id: 'work',
    nav: copy.sections.work,
    title: copy.sections.work,
    number: '01'
  },
  // One record, so it is named for what it is: "Achievements" promised a
  // list and then showed a slot saying the list was empty.
  achievements: {
    id: 'achievements',
    nav: copy.sections.publication,
    title: copy.sections.publication,
    number: '02'
  },
  cv: {
    id: 'cv',
    nav: copy.sections.cv,
    title: copy.sections.cvTitle,
    number: '03',
    href: '/cv.html'
  }
} satisfies Record<string, SectionDef>

export const menu: readonly SectionDef[] = Object.values(sections)
