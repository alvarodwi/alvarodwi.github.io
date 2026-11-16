# Portfolio Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** An unstyled, slide-deck portfolio site (hero, career, projects) built from a trimmed JSON Resume file, deployed to `alvarodwi.github.io`.

**Architecture:** A flat list of pages, each tagged with a section, is grouped into slides: one slide per section on desktop, one per page on mobile. The current page id is the single source of truth. Slide index, URL hash and the breakpoint switch all derive from it. Pure logic (grouping, hash resolution, key/swipe mapping, date formatting) lives in plain TS modules with Vitest tests. Vue components stay thin.

**Tech Stack:** Vue 3, TypeScript, Vite, UnoCSS (`presetWind3` only), Vitest, Yarn 4 (`nodeLinker: node-modules`), GitHub Actions + Pages.

**Spec:** `docs/superpowers/specs/2026-11-16-portfolio-design.md`

## Global Constraints

- Never stage or commit `linkedin-export.json`. `.gitignore` must list it before the first `git add`.
- **No commits unless the owner asks.** The owner's global rule overrides this skill's commit steps. Each task ends with a checkpoint where the owner is asked whether to commit.
- Configs are copied from `../ntrsv`: `eslint.config.js`, `.prettierrc`, `.prettierignore` and the tsconfigs. Not used: Pinia, vue-router, @vueuse/core, motion-v, web fonts, icons, attributify.
- Vite `base` is `/` (user site).
- Checks: `yarn format && yarn lint && yarn check && yarn test && yarn build` all pass at the end of every task.
- No styling beyond what layout needs to function (overflow scrolling, full-viewport slide). The styling phase comes later.
- Only `resume.json` fields listed in the spec are kept: `basics.name`, `basics.email`, `basics.profiles`, `work[].name/position/startDate/endDate`, the Unpad entry in `education[]`, and `projects[]`.

## Review Focus

1. **Timezone shift in dates.** Visitors west of UTC must see the month from the data. `"2024-10-01"` must render "Oct 2024", never "Sep 2024". Tested in Task 2 under `TZ=America/Los_Angeles`.
2. **Empty `endDate` (`""`) or a missing one** must both render "present". Tested in Task 2.
3. **Bad URL hash.** An empty, unknown or percent-encoded hash (`#`, `#nope`, `#career%2Dwork`) must land on a valid page. It should never show a blank deck. Tested in Task 3.
4. **Breakpoint change mid-deck.** Resizing desktop to mobile or back must keep the visitor on the slide containing their current page. Tested in Task 3.
5. **Keyboard hijack.** Space or Enter on a focused button must not advance twice. Ctrl/Alt/Meta + arrows (Alt+Left is browser Back) must stay untouched. Vertical swipes in a tall slide must not change slides. Tested in Task 3 (`keyAction`, `swipeAction`).

---

## File Structure

```
.gitignore, .yarnrc.yml, .prettierrc, .prettierignore, eslint.config.js
package.json, tsconfig.json, tsconfig.app.json, tsconfig.node.json
vite.config.ts, uno.config.ts, index.html (replaces Hello World)
.github/workflows/deploy.yml
src/main.ts, src/App.vue, src/vite-env.d.ts
src/data/resume.json          trimmed JSON Resume
src/types/resume.ts           Resume types (used fields only)
src/resume/work.ts            groupWork, formatRange (+ work.test.ts)
src/deck/slides.ts            pure deck logic (+ slides.test.ts)
src/deck/pages.ts             the page list (which component, which section)
src/composables/useDeck.ts    state: current page id, hash, breakpoint
src/components/Deck.vue       renders current slide, nav buttons, keys, swipe, focus
src/pages/HeroPage.vue, CareerWorkPage.vue, CareerEducationPage.vue, ProjectsPage.vue
```

---

### Task 1: Toolchain scaffold

**Files:**

- Create: everything in the first three rows of File Structure, plus `src/main.ts`, `src/App.vue`, `src/vite-env.d.ts`
- Modify: `index.html` (overwrite the existing Hello World file; the owner approved this in the spec)

**Interfaces:**

- Produces: `@/` alias for `src/`. `yarn test` runs `vitest run`. `App.vue` is the mount point that later tasks fill.

- [ ] **Step 1:** Write `.gitignore`. Use ntrsv's `.gitignore` minus the CodeGraph/Obsidian blocks, plus a line `linkedin-export.json`. Run `git status --short`. Expected: `linkedin-export.json` is no longer listed.
- [ ] **Step 2:** Copy `.yarnrc.yml`, `.prettierrc`, `.prettierignore`, `eslint.config.js`, `tsconfig.json` and `tsconfig.node.json` verbatim from `../ntrsv`. Copy `tsconfig.app.json` with `"types": ["vite/client"]` unchanged.
- [ ] **Step 3:** Write `package.json`: name `alvarodwi.github.io`, `private`, `type: module`. Scripts are ntrsv's plus `"test": "vitest run"`. Dependencies: `vue`, `@unocss/reset`. devDependencies: ntrsv's list minus `@iconify-json/ph`, `@unocss/preset-attributify`, `@unocss/preset-icons` and `@unocss/preset-web-fonts`, plus `vitest`. Copy versions from ntrsv. Add vitest with `yarn add -D vitest`.
- [ ] **Step 4:** Write `vite.config.ts`: ntrsv's file without the `define`/`packageJson` parts, plus `test: { environment: 'node' }` (add `/// <reference types="vitest/config" />`). Write `uno.config.ts`: `defineConfig({ presets: [presetWind3()] })`.
- [ ] **Step 5:** Write `index.html`. Use ntrsv's skeleton with title `Alvaro Dwi Oktaviano`, a one-line meta description, no favicon/OG/verification tags, and a `<noscript>` line. Write `src/main.ts`: ntrsv's file minus Pinia and router. Write `App.vue` rendering `<main>hello</main>`.
- [ ] **Step 6:** Run `yarn install && yarn format && yarn lint && yarn check && yarn build`. Expected: all pass. `dist/index.html` exists. `yarn test` exits 0 with "No test files found" (vitest 4 exits 0 with `--passWithNoTests`; add that flag to the script if it exits 1).
- [ ] **Step 7:** Checkpoint. Show `git status --short` and confirm `linkedin-export.json` is absent. Ask the owner whether to commit.

### Task 2: Resume data and work formatting

**Files:**

- Create: `src/data/resume.json`, `src/types/resume.ts`, `src/resume/work.ts`, `src/resume/work.test.ts`

**Interfaces:**

- Produces:
  - `interface Resume { basics: { name: string; email: string; profiles: { network: string; username: string; url: string }[] }; work: Work[]; education: Education[]; projects: Project[] }`
  - `interface Work { name: string; position: string; startDate: string; endDate?: string }`
  - `interface Education { institution: string; area: string; studyType: string; startDate: string; endDate?: string }`
  - `interface Project { name: string; description: string; url: string; keywords?: string[] }`
  - `interface WorkLine { name: string; position: string; ranges: { startDate: string; endDate?: string }[] }`
  - `groupWork(work: Work[]): WorkLine[]`
  - `formatRange(startDate: string, endDate?: string): string`

- [ ] **Step 1:** Write `src/data/resume.json` from `linkedin-export.json`. Keep `$schema`. In `basics`, keep only name, email and profiles: LinkedIn as in the export, plus `{ "network": "GitHub", "username": "alvarodwi", "url": "https://github.com/alvarodwi" }`. Copy all 7 `work` entries with only the 4 fields. Put in one `education` entry with `area: "Informatics Engineering"`. `projects` is `[]`. Run `grep -E 'phone|address|Antapani|0813' src/data/resume.json`. Expected: no output.
- [ ] **Step 2:** Write the failing tests in `src/resume/work.test.ts`:

```ts
test('formatRange: month + year, en-dash, present for open end', () => {
  expect(formatRange('2024-10-01', '')).toBe('Oct 2024 – present')
  expect(formatRange('2024-10-01')).toBe('Oct 2024 – present')
  expect(formatRange('2020-05-01', '2020-06-01')).toBe('May 2020 – Jun 2020')
})
test('groupWork merges consecutive same name+position, newest first as given', () => {
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
```

- [ ] **Step 3:** Run `yarn test`. Expected: FAIL (module not found).
- [ ] **Step 4:** Implement `src/types/resume.ts` and `src/resume/work.ts`. `formatRange` uses `toLocaleDateString('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })`; the `timeZone: 'UTC'` part is what makes Review Focus #1 pass.
- [ ] **Step 5:** Run `yarn test`, then `TZ=America/Los_Angeles yarn test`. Expected: both PASS.
- [ ] **Step 6:** Run the full check chain, then the commit checkpoint.

### Task 3: Deck logic (pure)

**Files:**

- Create: `src/deck/slides.ts`, `src/deck/slides.test.ts`

**Interfaces:**

- Produces:
  - `type SectionId = 'hero' | 'career' | 'projects'`
  - `const sectionTitles: Record<SectionId, string>` = `{ hero: 'Home', career: 'Career', projects: 'Projects' }`
  - `interface PageDef<C = unknown> { id: string; section: SectionId; title: string; component: C }`
  - `interface Slide<C = unknown> { label: string; pages: PageDef<C>[] }`
  - `buildSlides<C>(pages: PageDef<C>[], mobile: boolean): Slide<C>[]`. Desktop groups consecutive pages by section, `label = sectionTitles[section]`. Mobile gives one slide per page, `label = page.title`.
  - `slideIndexOf(slides: Slide[], pageId: string): number` returns `-1` if not found
  - `resolvePageId(pages: PageDef[], hash: string): string` strips `#`, runs `decodeURIComponent` (catching errors), and returns the page id if it exists, else `pages[0].id`
  - `type NavAction = 'next' | 'prev' | 'first' | 'last'`
  - `keyAction(e: { key: string; ctrlKey: boolean; altKey: boolean; metaKey: boolean; targetTag: string; targetEditable: boolean }): NavAction | null`
  - `swipeAction(dx: number, dy: number, threshold = 48): 'next' | 'prev' | null`

- [ ] **Step 1:** Write the failing tests with a 4-page fixture: `hero/hero`, `career-work/career`, `career-education/career`, `projects/projects`.

```ts
expect(buildSlides(pages, false).map((s) => s.label)).toEqual(['Home', 'Career', 'Projects'])
expect(buildSlides(pages, true)).toHaveLength(4)
// breakpoint switch keeps the visitor's page
expect(slideIndexOf(buildSlides(pages, false), 'career-education')).toBe(1)
expect(slideIndexOf(buildSlides(pages, true), 'career-education')).toBe(2)
expect(slideIndexOf(buildSlides(pages, true), 'nope')).toBe(-1)
// hash
expect(resolvePageId(pages, '#career-work')).toBe('career-work')
expect(resolvePageId(pages, '#career%2Dwork')).toBe('career-work')
for (const h of ['', '#', '#nope', '#%E0%A4%A']) expect(resolvePageId(pages, h)).toBe('hero')
// keys
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
expect(['ArrowRight', 'ArrowDown', 'PageDown', ' '].map((x) => k(x))).toEqual(Array(4).fill('next'))
expect(['ArrowLeft', 'ArrowUp', 'PageUp'].map((x) => k(x))).toEqual(Array(3).fill('prev'))
expect([k('Home'), k('End')]).toEqual(['first', 'last'])
expect(k('ArrowLeft', { altKey: true })).toBeNull()
expect(k('ArrowRight', { ctrlKey: true })).toBeNull()
expect(k(' ', { targetTag: 'BUTTON' })).toBeNull()
expect(k(' ', { targetTag: 'A' })).toBeNull()
expect(k('ArrowRight', { targetTag: 'INPUT' })).toBeNull()
expect(k('ArrowRight', { targetEditable: true })).toBeNull()
expect(k('x')).toBeNull()
// swipe: horizontal and past threshold only
expect(swipeAction(-60, 5)).toBe('next')
expect(swipeAction(60, 5)).toBe('prev')
expect(swipeAction(-30, 0)).toBeNull()
expect(swipeAction(-60, 120)).toBeNull()
```

- [ ] **Step 2:** Run `yarn test`. Expected: FAIL.
- [ ] **Step 3:** Implement `src/deck/slides.ts`. Arrows still work on a focused BUTTON; only Space and Enter are skipped there, because Enter is not a nav key and Space is the double-advance case.
- [ ] **Step 4:** Run `yarn test`. Expected: PASS.
- [ ] **Step 5:** Run the full check chain, then the commit checkpoint.

### Task 4: Page components and page list

**Files:**

- Create: `src/pages/HeroPage.vue`, `CareerWorkPage.vue`, `CareerEducationPage.vue`, `ProjectsPage.vue`, `src/deck/pages.ts`

**Interfaces:**

- Consumes: `resume.json` and the types/functions from Task 2. `PageDef` from Task 3.
- Produces: `export const pages: PageDef<Component>[]` in this order:
  - `hero` (section `hero`, title `Home`)
  - `career-work` (`career`, `Work`)
  - `career-education` (`career`, `Education`)
  - `projects` (`projects`, `Projects`)

- [ ] **Step 1:** Each page imports `@/data/resume.json` directly; there are no props.
  - **HeroPage:** `<h1>` with the name, a `mailto:` link showing the email, and links built from `basics.profiles`.
  - **CareerWorkPage:** `<h2>Work</h2>`, then a `<ul>` of `groupWork` lines: "position · company · ranges joined by ', '".
  - **CareerEducationPage:** `<h2>Education</h2>`, then a list of "studyType, area · institution · range".
  - **ProjectsPage:** `<h2>Projects</h2>`, then a `<ul>` of linked names with descriptions. When `projects` is empty, show `<p>Projects coming soon.</p>`.
  - External links get `rel="noopener"`.
- [ ] **Step 2:** Write `src/deck/pages.ts`.
- [ ] **Step 3:** Run `yarn lint && yarn build`. Expected: PASS. Run `grep -c Tritronik dist/assets/*.js`. Expected: ≥1, which shows the data is bundled.
- [ ] **Step 4:** Commit checkpoint.

### Task 5: Deck state and navigation

**Files:**

- Create: `src/composables/useDeck.ts`, `src/components/Deck.vue`
- Modify: `src/App.vue` (render `<Deck />`)

**Interfaces:**

- Consumes: `pages` (Task 4) and `buildSlides`, `slideIndexOf`, `resolvePageId`, `keyAction`, `swipeAction` (Task 3).
- Produces: `useDeck(pages: PageDef<Component>[]): { slides: ComputedRef<Slide<Component>[]>; index: ComputedRef<number>; current: ComputedRef<Slide<Component>>; go(action: NavAction): void }`

- [ ] **Step 1:** Implement `useDeck`.
  - **State:** `pageId = ref(resolvePageId(pages, location.hash))` and `mobile = ref(matchMedia('(max-width: 767px)').matches)`. Update `mobile` on the query's `change` event.
  - **Derived:** `slides`, `index = slideIndexOf(slides, pageId)`, and `current`.
  - **`go`:** clamps the new index and sets `pageId` to the target slide's `pages[0].id`.
  - **Hash:** a `watch(pageId)` calls `history.replaceState(null, '', '#' + id)`. A `hashchange` listener sets `pageId = resolvePageId(pages, location.hash)`.
  - **Cleanup:** remove the listeners in `onUnmounted`.
- [ ] **Step 2:** Implement `Deck.vue`.
  - **Slide:** `<Transition>` wraps a keyed `<section :key="current.label" tabindex="-1" aria-roledescription="slide" :aria-label="`${current.label}, ${index + 1} of ${slides.length}`" class="h-dvh overflow-y-auto">` that renders `current.pages` with `<component :is>`.
  - **Nav:** Previous and Next `<button>`s, disabled at the ends, plus an `index+1 / length` indicator.
  - **Keys:** a window `keydown` handler maps through `keyAction` (`targetTag = (e.target as HTMLElement).tagName`, `targetEditable = isContentEditable`), and calls `preventDefault` when the result isn't null.
  - **Swipe:** `pointerdown`/`pointerup` on the section, `pointerType === 'touch'` only, mapped through `swipeAction`.
  - **Focus:** `watch(index, () => nextTick(() => sectionEl.value?.focus()))`, so the initial load doesn't steal focus. This focuses the section, not its heading; the `aria-label` carries the announcement. This simplifies the spec's "focus heading".
- [ ] **Step 3:** Run `yarn dev` and check by hand, at both desktop and 375px widths (devtools):
  - (a) Arrows, Space, Home and End move between slides, and the hash updates.
  - (b) Tab to Next, press Space: it advances exactly one slide.
  - (c) Alt+Left leaves the page or does browser Back, and doesn't change slides.
  - (d) Desktop shows 3 slides with Career holding Work and Education. 375px shows 4 slides.
  - (e) On `#career-education` at desktop, shrinking to 375px stays on Education.
  - (f) Opening `/#nope` shows Home.
  - (g) Browser Back after navigating leaves the site.
  - (h) Touch-emulated horizontal swipe navigates, and vertical scroll doesn't.
- [ ] **Step 4:** Run the full check chain, then the commit checkpoint.

### Task 6: GitHub Pages deploy

**Files:**

- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1:** Write the workflow.
  - **Trigger:** `on: push: branches: [main]` and `workflow_dispatch`.
  - **Permissions:** `contents: read, pages: write, id-token: write`.
  - **Concurrency:** group `pages`.
  - **Build job:** `actions/checkout@v4`, `actions/setup-node@v4` (node 24), `corepack enable`, `yarn install --immutable`, `yarn build`, then `actions/upload-pages-artifact@v3` with `path: dist`.
  - **Deploy job:** needs build; environment `github-pages`; `actions/deploy-pages@v4`.
  - Check the default branch name with `git branch --show-current` and use that if it isn't `main`.
- [ ] **Step 2:** Run `yarn format && yarn check`. Expected: PASS.
- [ ] **Step 3:** Tell the owner the manual steps:
  1. Set Settings → Pages → Source to "GitHub Actions".
  2. Commit and push when they choose.
  3. Check that the Actions run is green and that `https://alvarodwi.github.io/#projects` opens on Projects.
