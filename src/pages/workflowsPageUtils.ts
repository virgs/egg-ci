import { TrackedProjectData } from '../domain-models/models'

export const hasEnabledProjects = (projects: TrackedProjectData[]): boolean =>
    projects.some((project) => project.enabled && !project.excluded)
