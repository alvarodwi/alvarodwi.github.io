<script setup lang="ts">
import resume from '@/data/resume.json'
import type { Project } from '@/types/resume'

const projects = resume.projects as Project[]
</script>

<template>
  <div>
    <h2>Projects</h2>
    <ul v-if="projects.length">
      <li v-for="p in projects" :key="p.url">
        <a :href="p.url" rel="noopener">{{ p.name }}</a>
        <template v-if="p.liveUrl"> · <a :href="p.liveUrl" rel="noopener">live</a> </template>
        · {{ p.description }}
        <template v-if="p.keywords?.length"> · {{ p.keywords.join(', ') }}</template>
      </li>
    </ul>
    <p v-else>Projects coming soon.</p>
  </div>
</template>
