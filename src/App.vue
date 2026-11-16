<script setup lang="ts">
import { pages } from '@/deck/pages'
</script>

<template>
  <main>
    <component :is="p.component" v-for="p in pages" :key="p.id" />
  </main>
</template>
