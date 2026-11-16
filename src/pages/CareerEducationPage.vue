<script setup lang="ts">
import resume from '@/data/resume.json'
import { formatRange } from '@/resume/work'
</script>

<template>
  <div>
    <h2>Education</h2>
    <ul>
      <li v-for="e in resume.education" :key="e.institution">
        {{ e.studyType }}, {{ e.area }} · {{ e.institution }} ·
        {{ formatRange(e.startDate, e.endDate) }}
      </li>
    </ul>
  </div>
</template>
