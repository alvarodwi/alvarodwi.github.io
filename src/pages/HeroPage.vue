<script setup lang="ts">
import resume from '@/data/resume.json'

const { name, email, profiles } = resume.basics
</script>

<template>
  <div>
    <h1>{{ name }}</h1>
    <p>
      <a :href="`mailto:${email}`">{{ email }}</a>
    </p>
    <ul>
      <li v-for="p in profiles" :key="p.network">
        <a :href="p.url" rel="noopener">{{ p.network }}</a>
      </li>
    </ul>
  </div>
</template>
