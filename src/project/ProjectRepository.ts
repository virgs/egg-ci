import { LocalStorageRepository } from '../db/LocalStorageRepository'
import { ProjectData, TrackedProjectData } from '../domain-models/models'
import { ProfileRepository } from '../profile/ProfileRepository'

const TRACKED_PROJECTS_KEY = 'trackedProjects'
const PROJECT_PREFIX_KEY = 'project'

const profileRepository = new ProfileRepository()

export class ProjectRepository extends LocalStorageRepository {
    public trackProject(project: TrackedProjectData) {
        const id = `${project.vcsType}/${project.username}/${project.reponame}`
        const currentProjects = this.loadTrackedProjects() ?? []
        if (currentProjects.some((trackedProject) => this.projectIdentifier(trackedProject) === id)) {
            return
        }
        currentProjects.push(project)
        this.persist(this.trackedProjectsKey(), currentProjects)
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
        this.persist(this.trackedProjectsKey(), currentProjects)
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
        this.persist(this.trackedProjectsKey(), currentProjects)
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
        this.persist(this.trackedProjectsKey(), currentProjects)
    }

    public loadTrackedProjects(): TrackedProjectData[] {
        const scoped = this.load(this.trackedProjectsKey()) as TrackedProjectData[] | undefined
        if (scoped) return scoped

        if (profileRepository.getActiveProfile().id === 'default') {
            return (this.load(TRACKED_PROJECTS_KEY) as TrackedProjectData[] | undefined) ?? []
        }
        return []
    }

    public persistProject(project: TrackedProjectData | ProjectData): void {
        const key = this.projectDataKey(project)
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
        this.persist(this.trackedProjectsKey(), currentProjects)
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
        this.persist(this.trackedProjectsKey(), currentProjects)
    }

    public loadProject(project: TrackedProjectData | ProjectData): ProjectData | undefined {
        const scoped = this.load(this.projectDataKey(project)) as ProjectData | undefined
        if (scoped) return scoped

        if (profileRepository.getActiveProfile().id === 'default') {
            return this.load(`${PROJECT_PREFIX_KEY}:${this.projectIdentifier(project)}`) as ProjectData | undefined
        }
        return undefined
    }

    public reorderProjects(orderedNonExcluded: TrackedProjectData[]): void {
        const currentProjects = this.loadTrackedProjects() ?? []
        const excluded = currentProjects.filter((p) => p.excluded)
        this.persist(this.trackedProjectsKey(), [...orderedNonExcluded, ...excluded])
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
        this.persist(this.trackedProjectsKey(), currentProjects)
    }

    public unexcludeAllProjects(): void {
        let currentProjects = this.loadTrackedProjects() ?? []
        currentProjects = currentProjects.map((trackedProject) => {
            trackedProject.excluded = undefined
            return trackedProject
        })
        this.persist(this.trackedProjectsKey(), currentProjects)
    }

    public setSyncFrequency(project: TrackedProjectData | ProjectData, syncFrequency: number): void {
        const id = `${this.projectIdentifier(project)}`
        let currentProjects = this.loadTrackedProjects() ?? []
        currentProjects = currentProjects.map((trackedProject) => {
            if (this.projectIdentifier(trackedProject) === id) {
                trackedProject.syncFrequency = syncFrequency
            }
            return trackedProject
        })
        this.persist(this.trackedProjectsKey(), currentProjects)
    }

    private projectIdentifier(project: TrackedProjectData | ProjectData): string {
        return `${project.vcsType}/${project.username}/${project.reponame}`
    }

    private trackedProjectsKey(): string {
        return profileRepository.scopedKey(TRACKED_PROJECTS_KEY)
    }

    private projectDataKey(project: TrackedProjectData | ProjectData): string {
        return `${profileRepository.scopedKey(PROJECT_PREFIX_KEY)}:${this.projectIdentifier(project)}`
    }
}
