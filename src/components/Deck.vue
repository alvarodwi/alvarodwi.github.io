<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'

import { useDeck } from '@/composables/useDeck'
import { pages } from '@/deck/pages'
import { keyAction, swipeAction, type NavAction } from '@/deck/slides'

const { slides, index, current, go } = useDeck(pages)
const sectionEl = ref<HTMLElement>()

// Focus moves only on visitor navigation, so load and resize never steal focus.
function navigate(action: NavAction) {
  const before = index.value
  go(action)
  if (index.value !== before) nextTick(() => sectionEl.value?.focus())
}

function onKey(e: KeyboardEvent) {
  const t = e.target as HTMLElement
  const action = keyAction({
    key: e.key,
    ctrlKey: e.ctrlKey,
    altKey: e.altKey,
    metaKey: e.metaKey,
    targetTag: t.tagName,
    targetEditable: t.isContentEditable,
  })
  if (!action) return
  e.preventDefault()
  navigate(action)
}
onMounted(() => addEventListener('keydown', onKey))
onUnmounted(() => removeEventListener('keydown', onKey))

let start: { x: number; y: number } | null = null
function onPointerDown(e: PointerEvent) {
  start = e.pointerType === 'touch' ? { x: e.clientX, y: e.clientY } : null
}
function onPointerUp(e: PointerEvent) {
  if (!start) return
  const action = swipeAction(e.clientX - start.x, e.clientY - start.y)
  start = null
  if (action) navigate(action)
}
</script>

<template>
  <!-- css=false: swap instantly until the styling phase adds transition CSS -->
  <Transition :css="false">
    <section
      :key="current.label"
      ref="sectionEl"
      tabindex="-1"
      aria-roledescription="slide"
      :aria-label="`${current.label}, ${index + 1} of ${slides.length}`"
      class="h-dvh touch-pan-y overflow-y-auto"
      @pointerdown="onPointerDown"
      @pointerup="onPointerUp"
      @pointercancel="start = null"
    >
      <component :is="p.component" v-for="p in current.pages" :key="p.id" />
    </section>
  </Transition>
  <nav aria-label="Slides" class="fixed right-0 bottom-0 flex gap-2 p-2">
    <button type="button" :disabled="index === 0" @click="navigate('prev')">Previous</button>
    <span>{{ index + 1 }} / {{ slides.length }}</span>
    <button type="button" :disabled="index === slides.length - 1" @click="navigate('next')">
      Next
    </button>
  </nav>
</template>
