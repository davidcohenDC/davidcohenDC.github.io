// Serves build/ for the length of one function, and gets out of the way.
//
// Three scripts needed the same twenty lines — start Vite's preview, wait for
// it to answer, kill it whatever happens — so they share them here.
//
// The port is whatever the operating system hands out. A fixed one looks
// tidier right up to the afternoon a stray server from an earlier run is
// still holding it and the script waits forty seconds for a page that is
// never coming.
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { setTimeout as sleep } from 'node:timers/promises'

function freePort() {
  return new Promise((resolve, reject) => {
    const probe = createServer()
    probe.on('error', reject)
    probe.listen(0, '127.0.0.1', () => {
      const { port } = probe.address()
      probe.close(() => resolve(port))
    })
  })
}

export async function withPreview(run) {
  const port = await freePort()
  const server = spawn(
    process.execPath,
    [
      'node_modules/vite/bin/vite.js',
      'preview',
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--strictPort'
    ],
    { stdio: 'ignore' }
  )
  const origin = `http://127.0.0.1:${port}`
  try {
    for (let attempt = 0; attempt < 60; attempt++) {
      if (server.exitCode !== null)
        throw new Error(`Preview server exited before serving ${origin}.`)
      // Only the connection attempt is allowed to fail quietly. Wrapping the
      // call to `run` in the same try would turn any error inside it into
      // fifteen seconds of waiting and a message blaming the server.
      let answered = false
      try {
        answered = (await fetch(origin)).ok
      } catch {
        /* Still starting. */
      }
      if (answered) return await run(origin)
      await sleep(250)
    }
    throw new Error(`Preview server at ${origin} never answered.`)
  } finally {
    server.kill()
  }
}

// Git Bash rewrites an argument that starts with a slash into a Windows path,
// so `/cv.html` arrives as `C:/Program Files/Git/cv.html`. Take the last
// segment of anything that names a page, and accept `cv.html` just as well.
export function pagePath(args) {
  const named = args.find((a) => /\.html?$/i.test(a))
  if (!named) return '/'
  const last = named.split('/').pop().split('\\').pop()
  return `/${last}`
}
