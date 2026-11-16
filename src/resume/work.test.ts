import { expect, test } from 'vitest'

import { formatRange, groupWork } from './work'

import resume from '@/data/resume.json'
import type { Work } from '@/types/resume'

test('formatRange: month + year, en-dash, present for open end', () => {
  expect(formatRange('2024-10-01', '')).toBe('Oct 2024 – present')
  expect(formatRange('2024-10-01')).toBe('Oct 2024 – present')
  expect(formatRange('2020-05-01', '2020-06-01')).toBe('May 2020 – Jun 2020')
})

test('groupWork merges consecutive same name+position, order as given', () => {
  const lines = groupWork([
    { name: 'A', position: 'Dev', startDate: '2021-07-01', endDate: '2021-10-01' },
    { name: 'A', position: 'Dev', startDate: '2020-05-01', endDate: '2020-06-01' },
    { name: 'B', position: 'X', startDate: '2023-02-01' },
    { name: 'B', position: 'Y', startDate: '2022-06-01' },
  ])
  expect(lines.map((l) => [l.name, l.position, l.ranges.length])).toEqual([
    ['A', 'Dev', 2],
    ['B', 'X', 1],
    ['B', 'Y', 1],
  ])
})

test('groupWork on real data yields 6 lines', () => {
  expect(groupWork(resume.work as Work[])).toHaveLength(6)
})
