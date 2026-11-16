export type SectionId = 'hero' | 'career' | 'projects'

export const sectionTitles: Record<SectionId, string> = {
  hero: 'Home',
  career: 'Career',
  projects: 'Projects',
}

export interface PageDef<C = unknown> {
  id: string
  section: SectionId
  title: string
  component: C
}

export interface Slide<C = unknown> {
  label: string
  pages: PageDef<C>[]
}

export type NavAction = 'next' | 'prev' | 'first' | 'last'

// Desktop joins a section's pages into one slide; mobile shows one page per slide.
export function buildSlides<C>(pages: PageDef<C>[], mobile: boolean): Slide<C>[] {
  if (mobile) return pages.map((p) => ({ label: p.title, pages: [p] }))
  const slides: Slide<C>[] = []
  for (const p of pages) {
    const last = slides.at(-1)
    if (last?.pages[0].section === p.section) last.pages.push(p)
    else slides.push({ label: sectionTitles[p.section], pages: [p] })
  }
  return slides
}

export function slideIndexOf(slides: Slide[], pageId: string): number {
  return slides.findIndex((s) => s.pages.some((p) => p.id === pageId))
}

export function resolvePageId(pages: PageDef[], hash: string): string {
  let id = hash.replace(/^#/, '')
  try {
    id = decodeURIComponent(id)
  } catch {
    // malformed escape: treat as unknown
  }
  return pages.some((p) => p.id === id) ? id : pages[0].id
}

const keyMap: Record<string, NavAction> = {
  ArrowRight: 'next',
  ArrowDown: 'next',
  PageDown: 'next',
  ' ': 'next',
  ArrowLeft: 'prev',
  ArrowUp: 'prev',
  PageUp: 'prev',
  Home: 'first',
  End: 'last',
}

export function keyAction(e: {
  key: string
  ctrlKey: boolean
  altKey: boolean
  metaKey: boolean
  targetTag: string
  targetEditable: boolean
}): NavAction | null {
  if (e.ctrlKey || e.altKey || e.metaKey) return null
  if (e.targetEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.targetTag)) return null
  // Space on a button/link activates it natively; handling it too would advance twice.
  if (e.key === ' ' && ['BUTTON', 'A'].includes(e.targetTag)) return null
  return keyMap[e.key] ?? null
}

export function swipeAction(dx: number, dy: number, threshold = 48): 'next' | 'prev' | null {
  if (Math.abs(dx) < threshold || Math.abs(dx) <= Math.abs(dy)) return null
  return dx < 0 ? 'next' : 'prev'
}
