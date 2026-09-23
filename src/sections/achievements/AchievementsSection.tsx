import { achievements } from '@/data/achievements'
import { Section, SectionHeading } from '@/ui/Section'
import { sections } from '../registry'
import AchievementEntry from './AchievementEntry'

// Same entry grammar as the projects; the difference is the source: a project
// is a repository, an achievement is a record somebody else holds.
//
// It sits on the band, edge to edge. The rounded panel it used to be was a
// card around a section — a box the page did not need to say where one part
// ended.
export default function AchievementsSection() {
  return (
    <Section
      section={sections.achievements}
      className="theme-shift border-y border-line bg-band"
    >
      <div className="shell section">
        <SectionHeading section={sections.achievements} size="landmark" />
        <div className="grid grid-cols-[minmax(0,1fr)]">
          {achievements.map((achievement) => (
            <AchievementEntry key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </Section>
  )
}
