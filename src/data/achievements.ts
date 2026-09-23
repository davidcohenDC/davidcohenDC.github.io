import { sources } from '@/content/sources'
import { paperToAchievement, type Achievement } from '@/domain/achievement'
import { paperMedia } from '@/media/bindings'
import { snapshot } from './snapshot'

// In the order of content/sources.ts; a paper the sync has never read is
// simply absent.
export const achievements: readonly Achievement[] = sources.papers.flatMap(
  ({ doi, code, archive }) => {
    const paper = snapshot.papers.find((record) => record.doi === doi)
    return paper
      ? [paperToAchievement(paper, { code, archive, image: paperMedia[doi] })]
      : []
  }
)

export const papers = snapshot.papers
