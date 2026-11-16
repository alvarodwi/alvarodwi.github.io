<script setup lang="ts">
import resume from '@/data/resume.json'
import { formatRange, groupWork } from '@/resume/work'
import type { Work } from '@/types/resume'

const lines = groupWork(resume.work as Work[])
</script>

<template>
  <div>
    <h2>Work</h2>
    <ul>
      <li v-for="l in lines" :key="l.name + l.position + l.ranges[0].startDate">
        {{ l.position }} · {{ l.name }} ·
        {{ l.ranges.map((r) => formatRange(r.startDate, r.endDate)).join(', ') }}
      </li>
    </ul>
  </div>
</template>
