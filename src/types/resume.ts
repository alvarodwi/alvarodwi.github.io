// Subset of the JSON Resume schema (jsonresume.org): only fields the site renders.
export interface Profile {
  network: string
  username: string
  url: string
}

export interface Work {
  name: string
  position: string
  startDate: string
  endDate?: string
}

export interface Education {
  institution: string
  area: string
  studyType: string
  startDate: string
  endDate?: string
}

export interface Project {
  name: string
  description: string
  url: string
  keywords?: string[]
}

export interface Resume {
  basics: { name: string; email: string; profiles: Profile[] }
  work: Work[]
  education: Education[]
  projects: Project[]
}
