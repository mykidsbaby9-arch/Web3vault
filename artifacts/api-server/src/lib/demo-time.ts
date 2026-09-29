/** Display-only timestamps for hardcoded demo activity; never use for stored records. */
export function demoMinutesAgo(): string {
  const minutes = 2 + Math.floor(Math.random() * 29)
  return new Date(Date.now() - minutes * 60_000).toISOString()
}