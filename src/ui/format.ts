const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

// Always absolute: the page is rendered at build time and hydrated later, and
// a relative "two days ago" would disagree between the two.
export function formatDate(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`
}

// "https://www.linkedin.com/in/x/" → "linkedin.com/in/x"
export function displayUrl(url: string) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
}

// A GitHub description is a phrase, not a sentence: it rarely ends in a full
// stop, so appending a claim to it used to read "…no PyTorch Mine, published
// on PyPI". This closes the first sentence before the second begins.
export function sentence(text: string) {
  return /[.!?]$/.test(text.trim()) ? text.trim() : `${text.trim()}.`
}
