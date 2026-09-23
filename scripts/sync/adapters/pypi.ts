import type { PackageSource } from '../ports'
import type { Http } from './http'

type PypiProject = {
  info: {
    version: string
    requires_python: string | null
    home_page: string | null
    project_urls: Record<string, string> | null
  }
  releases: Record<string, { upload_time: string }[]>
}

// A name on PyPI can belong to anyone: only a package that links back to the
// repository counts as published from it.
function linksBack(project: PypiProject, repositoryUrl: string) {
  const urls = [
    project.info.home_page,
    ...Object.values(project.info.project_urls ?? {})
  ]
  const target = repositoryUrl.toLowerCase().replace(/\/$/, '')
  return urls.some((url) => url?.toLowerCase().replace(/\/$/, '') === target)
}

// Downloads come from pypistats.org, a small service that rate-limits: when
// it declines, the rest of the record still stands.
export function createPypiSource({
  http,
  userAgent
}: {
  http: Http
  userAgent: string
}): PackageSource {
  const init = {
    headers: { 'User-Agent': userAgent, Accept: 'application/json' }
  }

  return {
    async packageOf(name, repositoryUrl) {
      const project = await http.json<PypiProject>(
        `pypi ${name}`,
        `https://pypi.org/pypi/${name}/json`,
        { init, missingIsOk: true }
      )
      if (!project || !linksBack(project, repositoryUrl)) return null
      const stats = await http.json<{ data?: { last_month?: number } }>(
        `pypistats ${name}`,
        `https://pypistats.org/api/packages/${name}/recent`,
        { init }
      )
      const { version, requires_python } = project.info
      return {
        name,
        version,
        uploaded: (project.releases[version]?.[0]?.upload_time ?? '').slice(
          0,
          10
        ),
        requiresPython: requires_python,
        downloadsLastMonth: stats?.data?.last_month ?? null
      }
    }
  }
}
