import type { Component } from 'vue'

import type { PageDef } from './slides'

import CareerEducationPage from '@/pages/CareerEducationPage.vue'
import CareerWorkPage from '@/pages/CareerWorkPage.vue'
import HeroPage from '@/pages/HeroPage.vue'
import ProjectsPage from '@/pages/ProjectsPage.vue'

// Order = deck order. Pages sharing a section join into one slide on desktop.
export const pages: PageDef<Component>[] = [
  { id: 'hero', section: 'hero', title: 'Home', component: HeroPage },
  { id: 'career-work', section: 'career', title: 'Work', component: CareerWorkPage },
  {
    id: 'career-education',
    section: 'career',
    title: 'Education',
    component: CareerEducationPage,
  },
  { id: 'projects', section: 'projects', title: 'Projects', component: ProjectsPage },
]
