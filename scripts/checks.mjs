// The four checks that need no browser, run at the same time.
//
// Prettier, oxlint, tsc and vitest do not depend on one another, and three of
// them finish in about a second. Run one after another they cost as much as
// the slowest plus the rest; run together they cost the slowest. That is the
// difference between a check you run after every edit and one you avoid.
//
// Output is held back and printed per command, so two of them failing at once
// still reads as two failures rather than as interleaved noise.
import { spawn } from 'node:child_process'

// One string each, run through the shell: `npx` is a script rather than an
// executable on Windows, and passing an argument list alongside `shell: true`
// is what Node deprecated in DEP0190.
const COMMANDS = [
  [
    'format',
    'npx prettier --check "{src,scripts,tests}/**/*.{ts,tsx,mjs,css}" "*.config.ts"'
  ],
  ['lint', 'npx oxlint'],
  ['types', 'npx tsc --noEmit'],
  ['tests', 'npx vitest run --silent']
]

function run([name, command]) {
  return new Promise((resolve) => {
    const started = Date.now()
    const child = spawn(command, { shell: true })
    let output = ''
    child.stdout.on('data', (d) => (output += d))
    child.stderr.on('data', (d) => (output += d))
    child.on('close', (code) =>
      resolve({ name, code, output, ms: Date.now() - started })
    )
  })
}

const results = await Promise.all(COMMANDS.map(run))
const failed = results.filter((r) => r.code !== 0)

for (const result of results)
  console.log(
    `  ${result.code === 0 ? 'PASS' : 'FAIL'}  ${result.name.padEnd(8)}${String(result.ms / 1000).padStart(5)}s`
  )

for (const result of failed) {
  console.log(`\n--- ${result.name} ---`)
  console.log(result.output.trim())
}

if (failed.length) process.exitCode = 1
