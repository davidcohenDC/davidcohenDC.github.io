import { ArrowLeft, FileDown, Mail, Printer } from 'lucide-react'
import { copy } from '@/content/copy'
import { documentCopy } from '@/content/document-copy'
import { experience } from '@/content/experience'
import { education, lastUpdated, profile } from '@/content/profile'
import {
  certification,
  languages,
  paperClaims,
  projectClaims,
  skills
} from '@/content/cv'
import { sources } from '@/content/sources'
import { papers } from '@/data/achievements'
import { moreProjects, projects } from '@/data/projects'
import { paperWhere, shortAuthor } from '@/domain/achievement'
import { GitHub, LinkedIn } from '@/ui/BrandIcons'
import { EntryTags } from '@/ui/Entry'
import { Floating, FloatingLink, ScrollTop } from '@/ui/Floating'
import ResourceLink from '@/ui/ResourceLink'
import { Section, SectionHeading } from '@/ui/Section'
import type { SectionDef } from '@/ui/Section'
import { displayUrl, sentence } from '@/ui/format'
import DocumentHeader from '../DocumentHeader'
import CvEntry, {
  CvEntryMetric,
  CvEntryPoints,
  CvEntryText,
  CvEntryTitle,
  CvEntryWhere,
  CvSkillRow
} from './CvEntry'

// The CV, in the portfolio's own design system: the same tokens, the same
// five sizes, the same headed sections, the same two themes. Before this it
// had a stylesheet of its own with its own greys and its own blue, which made
// the one page a recruiter actually reads look like it came from a different
// site.
//
// What it does not borrow is the layout, because a CV is a different kind of
// object: read in one pass, scanned down the left edge for dates, and printed.
// Hence CvEntry, and hence the measure below — 46rem rather than the site's
// 60, because this page is unbroken prose and prose wants a shorter line.

const page = 'cv-page mx-auto w-[min(46rem,calc(100%-2.5rem))]'

// The sections, once: they generate their own headings, their own anchors and
// the menu that links to them, so a section cannot exist without a way in.
const cvSections = {
  publication: {
    id: 'cv-research',
    nav: documentCopy.sections.publication,
    title: documentCopy.sections.publication,
    number: '01'
  },
  education: {
    id: 'cv-education',
    nav: documentCopy.sections.education,
    title: documentCopy.sections.education,
    number: '02'
  },
  experience: {
    id: 'cv-experience',
    nav: documentCopy.sections.experience,
    title: documentCopy.sections.experience,
    number: '03'
  },
  projects: {
    id: 'cv-projects',
    nav: documentCopy.sections.projectsNav,
    title: documentCopy.sections.projects,
    number: '04'
  },
  more: {
    id: 'cv-more',
    nav: documentCopy.sections.moreNav,
    title: documentCopy.sections.more,
    number: '05'
  },
  skills: {
    id: 'cv-skills',
    nav: documentCopy.sections.skillsNav,
    title: documentCopy.sections.skills,
    number: '06'
  }
} satisfies Record<string, SectionDef>

const ordered = Object.values(cvSections)

// The gap between one section and the next, and between a heading and what it
// introduces: the page's own rhythm, a little tighter, because a document is
// denser than a landing page.
const section = 'scroll-mt-8 pt-10'

// Every other section sits on the band, which is the page's own grammar:
// grounds alternate between blocks, never inside one. It reaches a little
// past the measure on both sides so the change of ground is a block the eye
// can see the edges of, and it is the quietest step that still reads as one —
// see --color-band in theme.css for what that cost in contrast.
const banded =
  'theme-shift -mx-4 rounded-2xl bg-band px-4 pb-6 md:-mx-8 md:px-8'

const ground = (index: number) =>
  index % 2 === 1 ? `${section} ${banded}` : section

const slug = (text: string) =>
  text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export default function Resume() {
  return (
    <>
      <a className="skip-link" href="#cv-main">
        {documentCopy.landmarks.skipToCv}
      </a>

      <span id="top" />
      <DocumentHeader
        menu={ordered}
        label={documentCopy.landmarks.cvSections}
      />

      {/* Hidden on paper: three things you can only do on a screen. */}
      <header className={`cv-tools ${page} flex flex-wrap gap-x-6 pt-4`}>
        <ResourceLink href="/" icon={ArrowLeft}>
          {documentCopy.actions.portfolio}
        </ResourceLink>
        <ResourceLink
          href="/david-cohen-cv.pdf"
          icon={FileDown}
          context={documentCopy.hints.pdf}
          download
        >
          {documentCopy.actions.download}
        </ResourceLink>
        <button data-print type="button" hidden className="text-link">
          <Printer size={20} aria-hidden="true" focusable="false" />
          <span>{documentCopy.actions.print}</span>
        </button>
      </header>

      <main id="cv-main" tabIndex={-1} className={`${page} pb-4`}>
        <header className="cv-head border-b border-line pt-6 pb-8">
          <p className="eyebrow text-muted">Curriculum vitae</p>
          <h1 className="display mt-2 mb-4 text-display">{profile.name}</h1>
          <p className="m-0 max-w-[62ch] text-base">{profile.description}</p>
          <address className="mt-5 flex flex-wrap items-center gap-x-6 not-italic">
            <ResourceLink href={`mailto:${profile.email}`} icon={Mail}>
              {profile.email}
            </ResourceLink>
            <ResourceLink href={profile.github} icon={GitHub}>
              {displayUrl(profile.github)}
            </ResourceLink>
            <ResourceLink href={profile.linkedin} icon={LinkedIn}>
              {displayUrl(profile.linkedin)}
            </ResourceLink>
          </address>
        </header>

        <Section section={cvSections.publication} className={ground(0)}>
          <SectionHeading section={cvSections.publication} />
          {papers.map((paper) => {
            const claim = paperClaims[paper.doi]
            const code = sources.papers.find((p) => p.doi === paper.doi)?.code
            const id = `cv-paper-${slug(paper.doi)}`
            return (
              <CvEntry
                key={paper.doi}
                titleId={id}
                dates={
                  <>
                    {paper.year}
                    {paper.openAccess && (
                      <>
                        <br />
                        {documentCopy.labels.openAccess}
                      </>
                    )}
                  </>
                }
              >
                <CvEntryTitle id={id}>
                  <a href={`https://doi.org/${paper.doi}`}>{paper.title}</a>
                </CvEntryTitle>
                <CvEntryWhere>
                  {paperWhere({ ...paper, openAccess: false })}
                </CvEntryWhere>
                <CvEntryText>
                  {paper.authors.map(shortAuthor).join(', ')}.
                </CvEntryText>
                {claim && (
                  <>
                    <CvEntryText>{claim.credit}</CvEntryText>
                    <CvEntryText>
                      {claim.contribution}
                      {code && (
                        <>
                          {' '}
                          <a className="link" href={code}>
                            {documentCopy.actions.codeAndDataset}
                          </a>
                          .
                        </>
                      )}
                    </CvEntryText>
                  </>
                )}
              </CvEntry>
            )
          })}
        </Section>

        <Section section={cvSections.education} className={ground(1)}>
          <SectionHeading section={cvSections.education} />
          {education.map((item) => {
            const id = `cv-education-${slug(item.degree)}`
            return (
              <CvEntry key={item.degree} titleId={id} dates={item.dates}>
                <CvEntryTitle id={id}>{item.degree}</CvEntryTitle>
                <CvEntryWhere>{item.institution}</CvEntryWhere>
                <CvEntryText>{item.detail}</CvEntryText>
              </CvEntry>
            )
          })}
        </Section>

        <Section section={cvSections.experience} className={ground(2)}>
          <SectionHeading section={cvSections.experience} />
          {experience.map((job) => {
            const id = `cv-job-${slug(job.organisation + '-' + job.role)}`
            return (
              <CvEntry key={id} titleId={id} dates={job.dates}>
                <CvEntryTitle id={id}>{job.role}</CvEntryTitle>
                <CvEntryWhere>{job.organisation}</CvEntryWhere>
                <CvEntryText>{job.description}</CvEntryText>
                {job.more && <CvEntryPoints items={job.more.items} />}
                <CvEntryWhere>{job.stack}.</CvEntryWhere>
              </CvEntry>
            )
          })}
        </Section>

        <Section section={cvSections.projects} className={ground(3)}>
          <SectionHeading section={cvSections.projects} />
          {projects.map((project) => {
            const claim = projectClaims[project.fullName]
            const id = `cv-project-${project.id}`
            return (
              <CvEntry key={project.id} titleId={id} dates={project.year}>
                <CvEntryTitle id={id}>
                  <a href={project.url}>{project.title}</a>
                </CvEntryTitle>
                <CvEntryText>
                  {sentence(project.description)}
                  {claim && ` ${claim.contribution}`}
                </CvEntryText>
                {project.metric && (
                  <CvEntryMetric
                    value={project.metric.value}
                    label={project.metric.label}
                  />
                )}
                {claim && <CvEntryPoints items={claim.decisions} />}
                {project.technologies.length > 0 && (
                  <EntryTags
                    label={`${project.title} technologies`}
                    items={project.technologies}
                  />
                )}
              </CvEntry>
            )
          })}
        </Section>

        <Section section={cvSections.more} className={ground(4)}>
          <SectionHeading section={cvSections.more} />
          {moreProjects.map((project) => {
            const id = `cv-more-${project.id}`
            return (
              <CvEntry key={project.url} titleId={id} dates={project.year}>
                <CvEntryTitle id={id}>
                  <a href={project.url}>{project.title}</a>
                </CvEntryTitle>
                <CvEntryText>{sentence(project.description)}</CvEntryText>
              </CvEntry>
            )
          })}
        </Section>

        <Section section={cvSections.skills} className={ground(5)}>
          <SectionHeading section={cvSections.skills} />
          {/* The same two columns as every entry above it, so the page keeps
              one rule down its left edge from the first line to the last. */}
          <dl className="m-0">
            {skills.map((area) => (
              <CvSkillRow key={area.title} label={area.title}>
                {area.items}
              </CvSkillRow>
            ))}
            <CvSkillRow label={documentCopy.lists.languages}>
              {languages}
            </CvSkillRow>
            <CvSkillRow label={documentCopy.lists.certification}>
              {certification}
            </CvSkillRow>
          </dl>
        </Section>
      </main>

      <footer
        className={`${page} mono flex flex-wrap gap-x-3 border-t border-line py-6 text-xs text-muted`}
      >
        <span>{copy.sections.cvTitle}</span>
        <span aria-hidden="true">·</span>
        <a className="link" href="/">
          {displayUrl(profile.origin)}
        </a>
        <span aria-hidden="true">·</span>
        <span>
          {documentCopy.labels.updated}{' '}
          <time dateTime={lastUpdated.iso}>{lastUpdated.label}</time>
        </span>
        <a className="link ml-auto flex min-h-9 items-center" href="#top">
          {copy.actions.backToTop} ↑
        </a>
      </footer>

      {/* The two things worth reaching for from anywhere in a long document:
          the copy to keep, and the way back to the top. */}
      <Floating>
        <FloatingLink
          href="/david-cohen-cv.pdf"
          download
          icon={FileDown}
          label={documentCopy.hints.downloadCv}
        />
        <ScrollTop label={copy.actions.backToTop} />
      </Floating>
    </>
  )
}
