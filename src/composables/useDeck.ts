import { computed, onMounted, onUnmounted, ref, watch, type Component } from 'vue'

import {
  buildSlides,
  resolvePageId,
  slideIndexOf,
  type NavAction,
  type PageDef,
} from '@/deck/slides'

const MOBILE_QUERY = '(max-width: 767px)'

// The current page id is the single source of truth; slide index, hash and
// breakpoint behavior all derive from it.
export function useDeck(pages: PageDef<Component>[]) {
  const pageId = ref(resolvePageId(pages, location.hash))
  const media = matchMedia(MOBILE_QUERY)
  const mobile = ref(media.matches)

  const slides = computed(() => buildSlides(pages, mobile.value))
  const index = computed(() => Math.max(0, slideIndexOf(slides.value, pageId.value)))
  const current = computed(() => slides.value[index.value])

  function go(action: NavAction) {
    const last = slides.value.length - 1
    const target = {
      next: Math.min(index.value + 1, last),
      prev: Math.max(index.value - 1, 0),
      first: 0,
      last,
    }[action]
    pageId.value = slides.value[target].pages[0].id
  }

  // replaceState: browser Back leaves the site instead of stepping through slides.
  watch(pageId, (id) => history.replaceState(null, '', `#${id}`), { immediate: true })

  const onHash = () => (pageId.value = resolvePageId(pages, location.hash))
  const onMedia = (e: MediaQueryListEvent) => (mobile.value = e.matches)
  onMounted(() => {
    addEventListener('hashchange', onHash)
    media.addEventListener('change', onMedia)
  })
  onUnmounted(() => {
    removeEventListener('hashchange', onHash)
    media.removeEventListener('change', onMedia)
  })

  return { slides, index, current, go }
}
