# Portfolio site — design

Date: 2026-11-16

## Intent

A casual personal page at `alvarodwi.github.io`, linked from the owner's GitHub
and LinkedIn profiles. Its job: show off projects and recent work, and let
visitors reach the owner by email. The owner is not job hunting; the tone is
playful (an anime meme replaces a selfie on the hero later). Recruiters may
land on it but are not the target audience.

Content comes from a JSON Resume (jsonresume.org) file derived from a LinkedIn
export. The site is shaped like a slide deck. This phase is structure only;
styling and transitions come later.

## Goals

- Three sections, in order:
  1. **Hero**: name, email (`mailto:`), LinkedIn and GitHub links.
  2. **Career**: work history as company, position, date range (no highlight
     bullets), plus one education line (Universitas Padjadjaran).
  3. **Projects**: hand-picked GitHub projects.
- Deck navigation: one slide on screen at a time, like PowerPoint.
- Mobile-ready structure: on small screens a section can be split into several
  "pages" (book-like); on desktop those pages join into one slide.
- Deploy to GitHub Pages as a user site.

## Non-goals (this phase)

- Visual design, fonts, colors, slide transitions (motion-v comes later).
- Hero extras: anime meme image, gacha profile, Duolingo streak. The hero
  component is where they will go; no placeholder code for them now.
- Highlights/summary text for jobs, skills, languages sections.
- SEO, analytics, i18n, dark mode toggle.

## Anti-goals

- **Never publish the raw LinkedIn export.** It contains a phone number and
  home address. The repo is public (GitHub Pages), so committing it publishes
  it via git history even if the site never renders it.
- Not a formal CV. Must not read like one.

## Constraints

- Stack follows the sibling `ntrsv` project: Vue 3 + TypeScript + Vite +
  UnoCSS (`presetWind3`), Yarn 4, ESLint + Prettier configs copied from ntrsv.
  Dropped from ntrsv: Pinia, vue-router, @vueuse/core (not needed for this
  size). motion-v is deferred to the styling phase.
- GitHub Pages user site: the GitHub repo must be named
  `alvarodwi.github.io` so the site serves from `/`; Vite `base` stays `/`.
- Checks: `yarn format && yarn lint && yarn check && yarn build`, same as ntrsv.

## Approaches considered

- **A. One scrolling page with CSS scroll-snap sections.** Least code; scroll,
  touch, keyboard and screen readers work natively. Rejected: feels less like a
  deck; owner wants the PowerPoint feel.
- **B. One slide at a time, switched by index (chosen).** True deck feel and
  first-class transitions later. Cost: the site builds its own navigation
  (keys, buttons, swipe), focus handling, and overflow handling.
- Existing JSON Resume themes: rejected, CV-shaped. Plain HTML without Vue:
  rejected, owner wants ntrsv's stack.

## Design

### Data

- `linkedin-export.json` stays local and is listed in `.gitignore`.
- `src/data/resume.json` is a hand-trimmed JSON Resume file, keeping the
  `$schema` key. Contains only:
  - `basics`: `name`, `email`, `profiles` (LinkedIn, GitHub).
  - `work[]`: `name`, `position`, `startDate`, `endDate` (empty = present).
  - `education[]`: Universitas Padjadjaran only, `area` fixed to
    "Informatics Engineering" (the export merged SMKN into it).
  - `projects[]`: `name`, `description`, `url`, optional `keywords`. Starts
    empty; owner fills it from GitHub.
- Imported at build time (`import resume from '@/data/resume.json'`). Nothing
  in `public/`, no fetch.
- `src/types/resume.ts`: a small TS type covering only the fields above.
- Display rule: consecutive work entries with the same `name` and `position`
  render as one line with both date ranges (the two Someah stints). The two
  Bangkit entries differ in position and stay separate.

### Pages, slides, and layouts

The deck is built from a flat, ordered list of **pages**. Each page has an
`id`, the `section` it belongs to, and a component to render.

```
pages: hero | career-work | career-education | projects
sections:  hero   |        career                  | projects
```

- **Desktop** (wide viewport): one slide per section. A slide renders all of
  its section's pages side by side or stacked (styling decides).
- **Mobile** (narrow viewport): one slide per page.
- The breakpoint is a single `matchMedia` query in one composable. The deck
  recomputes its slide list when it changes and keeps the visitor on the slide
  containing the page they were on.
- How sections split into pages is static, declared in one file
  (`src/deck.ts`). The split above is the starting point; the owner re-splits
  later (e.g. one page per project) by editing that file.

### Navigation

- Next: `ArrowRight`, `ArrowDown`, `PageDown`, `Space`; previous: `ArrowLeft`,
  `ArrowUp`, `PageUp`; `Home`/`End` jump to first/last. Keys are ignored when
  focus is in a form field (none exist yet, but cheap to guard).
- Visible prev/next buttons and a "2 / 3" indicator.
- Horizontal swipe on touch (pointer events, distance threshold). Vertical
  movement is left alone so tall slides can scroll internally.
- **URL hash** holds the current page id (`#career-work`). Using page ids
  keeps a link valid across breakpoints: on desktop it resolves to the slide
  containing that page. Updated with `history.replaceState`, so the browser
  Back button leaves the site instead of stepping through slides. A
  `hashchange` listener handles manual edits; unknown hash falls back to the
  first slide.
- Only the current slide is rendered (`v-if`), wrapped in Vue `<Transition>`
  with no animation yet, so transitions can be added in the styling phase.

### Accessibility

- Each slide is a `<section>` with `aria-roledescription="slide"` and an
  `aria-label` ("Career, 2 of 3").
- On slide change, focus moves to the slide's heading (`tabindex="-1"`), so
  screen readers announce the new content.
- A slide whose content is taller than the viewport scrolls inside itself
  (`overflow-y: auto`) rather than being cut off.
- Prev/next buttons have text labels and are disabled at the ends.

### Deploy

- GitHub Actions workflow: build with Yarn, upload `dist/` with
  `actions/upload-pages-artifact`, deploy with `actions/deploy-pages`.
- No SPA 404 workaround needed: one `index.html`, state lives in the hash.
- This folder is the existing `alvarodwi.github.io` repo. Its only content is
  a 7-year-old "Hello World" `index.html`, which Vite's `index.html` replaces.
- Repo setting: Pages source must be switched to "GitHub Actions" (owner does
  this in GitHub settings).
- `.gitignore` (with `linkedin-export.json`) must exist before anything is
  staged; the export is currently untracked.

## Left to the builder

- Exact file layout under `src/components/` and component names.
- Swipe threshold and breakpoint width (pick sensible defaults, e.g. 48px and
  768px).
- Placeholder content of the projects slide while `projects` is empty.
