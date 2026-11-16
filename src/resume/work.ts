import type { Work } from '@/types/resume'

export interface WorkLine {
  name: string
  position: string
  ranges: { startDate: string; endDate?: string }[]
}

// UTC so 'YYYY-MM-DD' never shifts to the previous month west of UTC.
const month = (date: string) =>
  new Date(date).toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })

export function formatRange(startDate: string, endDate?: string): string {
  return `${month(startDate)} – ${endDate ? month(endDate) : 'present'}`
}

export function groupWork(work: Work[]): WorkLine[] {
  const lines: WorkLine[] = []
  for (const { name, position, startDate, endDate } of work) {
    const last = lines.at(-1)
    if (last?.name === name && last.position === position) last.ranges.push({ startDate, endDate })
    else lines.push({ name, position, ranges: [{ startDate, endDate }] })
  }
  return lines
}
