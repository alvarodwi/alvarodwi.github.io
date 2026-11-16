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
        <a :href="p.url" rel="noopener">{{ p.name }}</a> · {{ p.description }}
      </li>
    </ul>
    <p v-else>Projects coming soon.</p>
  </div>
</template>
