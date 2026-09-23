type Options = {
  init?: RequestInit
  // A 404 that is an answer ("no release yet"), not a failure.
  missingIsOk?: boolean
}

// Every outbound call goes through here. A failed call answers `null` and is
// recorded in `failures`, so one source being down never stops the sync.
export function createHttp() {
  const failures: string[] = []

  async function request(label: string, url: string, options: Options) {
    try {
      const response = await fetch(url, options.init)
      if (response.ok) return response
      if (!(response.status === 404 && options.missingIsOk))
        failures.push(`${label}: HTTP ${response.status}`)
    } catch (error) {
      failures.push(`${label}: ${(error as Error).message}`)
    }
    return null
  }

  return {
    failures,
    async json<T>(label: string, url: string, options: Options = {}) {
      const response = await request(label, url, options)
      return response ? ((await response.json()) as T) : null
    },
    async text(label: string, url: string, options: Options = {}) {
      const response = await request(label, url, options)
      return response ? await response.text() : null
    }
  }
}

export type Http = ReturnType<typeof createHttp>
