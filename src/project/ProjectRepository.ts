import { LocalStorageRepository } from '../db/LocalStorageRepository'
import { ProjectData, TrackedProjectData } from '../domain-models/models'

const TRACKED_PROJECTS_KEY = 'trackedProjects'
const PROJECT_PREFIX_KEY = 'project'

export class ProjectRepository extends LocalStorageRepository {
    public trackProject(project: TrackedProjectData) {
        const id = `${project.vcsType}/${project.username}/${project.reponame}`
        const currentProjects = this.loadTrackedProjects() ?? []
        if (currentProjects.some((trackedProject) => this.projectIdentifier(trackedProject) === id)) {
            return
        }
        currentProjects.push(project)
        this.persist(TRACKED_PROJECTS_KEY, currentProjects)
    }

    public enableProject(project: TrackedProjectData | ProjectData) {
        const id = `${this.projectIdentifier(project)}`
        let currentProjects = this.loadTrackedProjects() ?? []
        currentProjects = currentProjects?.map((trackedProject) => {
            const trackedProjectId = `${this.projectIdentifier(trackedProject)}`
            if (trackedProjectId === id) {
                trackedProject.enabled = true
            }
            return trackedProject
        })
        this.persist(TRACKED_PROJECTS_KEY, currentProjects)
    }

    public disableProject(project: TrackedProjectData | ProjectData) {
        const id = `${this.projectIdentifier(project)}`
        let currentProjects = this.loadTrackedProjects() ?? []
        currentProjects = currentProjects?.map((trackedProject) => {
            const trackedProjectId = `${this.projectIdentifier(trackedProject)}`
            if (trackedProjectId === id) {
                trackedProject.enabled = false
            }
            return trackedProject
        })
        this.persist(TRACKED_PROJECTS_KEY, currentProjects)
    }

    public setProjectIncludeBuildJobs(project: TrackedProjectData | ProjectData, value: boolean) {
        const id = `${this.projectIdentifier(project)}`
        let currentProjects = this.loadTrackedProjects() ?? []
        currentProjects = currentProjects?.map((trackedProject) => {
            const trackedProjectId = `${this.projectIdentifier(trackedProject)}`
            if (trackedProjectId === id) {
                trackedProject.includeBuildJobs = value
            }
            return trackedProject
        })
        this.persist(TRACKED_PROJECTS_KEY, currentProjects)
    }

    public loadTrackedProjects(): TrackedProjectData[] {
        return this.load(TRACKED_PROJECTS_KEY) as TrackedProjectData[]
    }

    public persistProject(project: TrackedProjectData | ProjectData): void {
        const key = `${PROJECT_PREFIX_KEY}:${this.projectIdentifier(project)}`
        return this.persist(key, project)
    }

    public setProjectCollapsed(project: TrackedProjectData | ProjectData, collapsed: boolean): void {
        const id = `${this.projectIdentifier(project)}`
        let currentProjects = this.loadTrackedProjects() ?? []
        currentProjects = currentProjects?.map((trackedProject) => {
            const trackedProjectId = `${this.projectIdentifier(trackedProject)}`
            if (trackedProjectId === id) {
                trackedProject.collapsed = collapsed
            }
            return trackedProject
        })
        this.persist(TRACKED_PROJECTS_KEY, currentProjects)
    }

    public setProjectHiddenJobs(project: TrackedProjectData | ProjectData, hiddenJobs: string[]): void {
        const id = `${this.projectIdentifier(project)}`
        let currentProjects = this.loadTrackedProjects() ?? []
        currentProjects = currentProjects?.map((trackedProject) => {
            const trackedProjectId = `${this.projectIdentifier(trackedProject)}`
            if (trackedProjectId === id) {
                trackedProject.hiddenJobs = hiddenJobs
            }
            return trackedProject
        })
        this.persist(TRACKED_PROJECTS_KEY, currentProjects)
    }

    public loadProject(project: TrackedProjectData | ProjectData): ProjectData | undefined {
        const key = `${PROJECT_PREFIX_KEY}:${this.projectIdentifier(project)}`
        return this.load(key) as ProjectData | undefined
    }

    public reorderProjects(orderedNonExcluded: TrackedProjectData[]): void {
        const currentProjects = this.loadTrackedProjects() ?? []
        const excluded = currentProjects.filter((p) => p.excluded)
        this.persist(TRACKED_PROJECTS_KEY, [...orderedNonExcluded, ...excluded])
    }

    public excludeProject(project: TrackedProjectData | ProjectData): void {
        const id = `${this.projectIdentifier(project)}`
        let currentProjects = this.loadTrackedProjects() ?? []
        currentProjects = currentProjects.map((trackedProject) => {
            if (this.projectIdentifier(trackedProject) === id) {
                trackedProject.excluded = true
            }
            return trackedProject
        })
        this.persist(TRACKED_PROJECTS_KEY, currentProjects)
    }

    public unexcludeAllProjects(): void {
        let currentProjects = this.loadTrackedProjects() ?? []
        currentProjects = currentProjects.map((trackedProject) => {
            trackedProject.excluded = undefined
            return trackedProject
        })
        this.persist(TRACKED_PROJECTS_KEY, currentProjects)
    }

    private projectIdentifier(project: TrackedProjectData | ProjectData): string {
        return `${project.vcsType}/${project.username}/${project.reponame}`
    }
}
