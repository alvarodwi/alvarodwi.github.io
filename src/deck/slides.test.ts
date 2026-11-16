import { expect, test } from 'vitest'

import {
  buildSlides,
  keyAction,
  resolvePageId,
  slideIndexOf,
  swipeAction,
  type PageDef,
} from './slides'

const pages: PageDef[] = [
  { id: 'hero', section: 'hero', title: 'Home', component: null },
  { id: 'career-work', section: 'career', title: 'Work', component: null },
  { id: 'career-education', section: 'career', title: 'Education', component: null },
  { id: 'projects', section: 'projects', title: 'Projects', component: null },
]

test('buildSlides: one slide per section on desktop, per page on mobile', () => {
  expect(buildSlides(pages, false).map((s) => s.label)).toEqual(['Home', 'Career', 'Projects'])
  expect(buildSlides(pages, true)).toHaveLength(4)
})

test('slideIndexOf keeps the visitor on their page across breakpoints', () => {
  expect(slideIndexOf(buildSlides(pages, false), 'career-education')).toBe(1)
  expect(slideIndexOf(buildSlides(pages, true), 'career-education')).toBe(2)
  expect(slideIndexOf(buildSlides(pages, true), 'nope')).toBe(-1)
})

test('resolvePageId falls back to the first page on bad hashes', () => {
  expect(resolvePageId(pages, '#career-work')).toBe('career-work')
  expect(resolvePageId(pages, '#career%2Dwork')).toBe('career-work')
  for (const h of ['', '#', '#nope', '#%E0%A4%A']) expect(resolvePageId(pages, h)).toBe('hero')
})

const k = (key: string, extra = {}) =>
  keyAction({
    key,
    ctrlKey: false,
    altKey: false,
    metaKey: false,
    targetTag: 'BODY',
    targetEditable: false,
    ...extra,
  })

test('keyAction maps nav keys', () => {
  expect(['ArrowRight', 'ArrowDown', 'PageDown', ' '].map((x) => k(x))).toEqual(
    Array(4).fill('next'),
  )
  expect(['ArrowLeft', 'ArrowUp', 'PageUp'].map((x) => k(x))).toEqual(Array(3).fill('prev'))
  expect([k('Home'), k('End')]).toEqual(['first', 'last'])
  expect(k('x')).toBeNull()
})

test('keyAction leaves modifiers, buttons and fields alone', () => {
  expect(k('ArrowLeft', { altKey: true })).toBeNull()
  expect(k('ArrowRight', { ctrlKey: true })).toBeNull()
  expect(k('ArrowRight', { metaKey: true })).toBeNull()
  expect(k(' ', { targetTag: 'BUTTON' })).toBeNull()
  expect(k(' ', { targetTag: 'A' })).toBeNull()
  expect(k('ArrowRight', { targetTag: 'BUTTON' })).toBe('next')
  expect(k('ArrowRight', { targetTag: 'INPUT' })).toBeNull()
  expect(k('ArrowRight', { targetEditable: true })).toBeNull()
})

test('swipeAction: horizontal and past threshold only', () => {
  expect(swipeAction(-60, 5)).toBe('next')
  expect(swipeAction(60, 5)).toBe('prev')
  expect(swipeAction(-30, 0)).toBeNull()
  expect(swipeAction(-60, 120)).toBeNull()
})
