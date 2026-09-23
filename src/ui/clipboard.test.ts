import { copyText, type Host } from './clipboard'

// A stand-in for the page: a clipboard that records what it was given, and
// a document whose copy command says whether it worked.
function host({
  secure,
  api,
  command
}: {
  secure: boolean
  api?: 'writes' | 'refuses'
  command: boolean
}) {
  const written: string[] = []
  const field = {
    value: '',
    style: {} as Record<string, string>,
    setAttribute: () => {},
    select: () => {},
    remove: () => {}
  }
  const copied: string[] = []
  const fake: Host = {
    isSecureContext: secure,
    clipboard: api
      ? {
          writeText: async (text) => {
            if (api === 'refuses') throw new Error('denied')
            written.push(text)
          }
        }
      : undefined,
    document: {
      createElement: (() => field) as unknown as Document['createElement'],
      execCommand: () => {
        copied.push(field.value)
        return command
      },
      body: { append: () => {} } as unknown as HTMLElement
    }
  }
  return { fake, written, copied }
}

test('on HTTPS the Clipboard API does the copying', async () => {
  const { fake, written, copied } = host({
    secure: true,
    api: 'writes',
    command: true
  })
  expect(await copyText('a@b.c', fake)).toBe(true)
  expect(written).toEqual(['a@b.c'])
  expect(copied).toEqual([])
})

// The case that shipped broken: plain HTTP at an address has no API at all.
test('over plain HTTP, with no API, the copy command does it', async () => {
  const { fake, copied } = host({ secure: false, command: true })
  expect(await copyText('a@b.c', fake)).toBe(true)
  expect(copied).toEqual(['a@b.c'])
})

test('an API that refuses falls back to the copy command', async () => {
  const { fake, copied } = host({
    secure: true,
    api: 'refuses',
    command: true
  })
  expect(await copyText('a@b.c', fake)).toBe(true)
  expect(copied).toEqual(['a@b.c'])
})

test('when nothing can copy, it says so rather than pretending', async () => {
  const { fake } = host({ secure: false, command: false })
  expect(await copyText('a@b.c', fake)).toBe(false)
})
