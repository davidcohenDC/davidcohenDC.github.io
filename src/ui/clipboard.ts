// Copying text to the clipboard, wherever the page happens to be opened.
//
// The Clipboard API exists only in a secure context — HTTPS, or localhost —
// so the same page opened over plain HTTP at an address (a phone on the
// network, a preview on a server) has no `navigator.clipboard` at all, and a
// button built on it alone does nothing there. A capability is checked, never
// assumed: the API where it exists and answers, and otherwise a hidden text
// field and the older copy command, which a browser still honours during a
// click.
//
// The browser is passed in rather than reached for, so every path can be
// exercised by a unit test without one (clipboard.test.ts).

export type Host = {
  isSecureContext: boolean
  clipboard?: { writeText(text: string): Promise<void> }
  document: Pick<Document, 'createElement' | 'execCommand' | 'body'>
}

function browserHost(): Host {
  return {
    isSecureContext: window.isSecureContext,
    clipboard: navigator.clipboard,
    document
  }
}

async function withApi(text: string, host: Host) {
  if (!host.isSecureContext || !host.clipboard) return false
  try {
    await host.clipboard.writeText(text)
    return true
  } catch {
    // Refused — no permission, or the page lost focus.
    return false
  }
}

function withCommand(text: string, host: Host) {
  const field = host.document.createElement('textarea')
  field.value = text
  field.setAttribute('readonly', '')
  field.style.position = 'fixed'
  field.style.opacity = '0'
  host.document.body.append(field)
  field.select()
  try {
    return host.document.execCommand('copy')
  } catch {
    return false
  } finally {
    field.remove()
  }
}

// Resolves to whether the text is on the clipboard.
export async function copyText(text: string, host: Host = browserHost()) {
  return (await withApi(text, host)) || withCommand(text, host)
}
