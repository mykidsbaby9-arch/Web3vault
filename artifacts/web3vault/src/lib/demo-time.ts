/** Relative display for simulated activity only, never for real records. */
export function formatDemoAge(timestamp: string | number): string {
  const minutes = Math.round((Date.now() - new Date(timestamp).getTime()) / 60_000)
  return `${Math.max(2, Math.min(30, minutes))} min ago`
}

// These IDs are the original, preloaded showcase rows, not user-created records.
// Keep their stored timestamps unchanged; only the label in the demo UI is recent.
const seededIds = {
  swaps: new Set([1, 2, 3]),
  bridges: new Set([1, 2]),
  transactions: new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
  notifications: new Set([1, 2, 3, 4, 5, 6, 7]),
  rewards: new Set([1, 2, 3, 4, 5, 6, 7, 8]),
  announcements: new Set([1, 2, 3]),
} as const

const seededAges = new Map<string, number>()
const seedCutoff = Date.UTC(2026, 6, 2)

export function seededDemoAge(
  source: keyof typeof seededIds,
  id: number,
  timestamp: string,
): string | null {
  // The cutoff avoids treating newly created records with reused IDs as seeds.
  if (!seededIds[source].has(id) || Date.parse(timestamp) >= seedCutoff) return null
  const key = `${source}:${id}`
  if (!seededAges.has(key)) seededAges.set(key, 2 + Math.floor(Math.random() * 29))
  return `Demo · ${seededAges.get(key)} min ago`
}