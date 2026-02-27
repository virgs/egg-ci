import { ProjectRepository } from './ProjectRepository'
import { ProjectData, TrackedProjectData } from '../domain-models/models'
import { emitProjectSynched } from '../events/Events'
import { circleCiClient } from '../gateway/CircleCiClient'
import { WorkflowFetcher } from './WorkflowFetcher'

export class ProjectService {
    private readonly projectRepository = new ProjectRepository()

    public async listUserProjects(): Promise<TrackedProjectData[]> {
        const userProjects = await circleCiClient.listUserProjects()
        return await Promise.all(
            userProjects.map(async (project) => ({
                enabled: false,
                vcsType: project.vcs_type,
                reponame: project.reponame,
                username: project.username,
                defaultBranch: project.default_branch,
                vcsUrl: project.vcs_url,
            }))
        )
    }
    public trackProject(project: TrackedProjectData) {
        return this.projectRepository.trackProject(project)
    }

    public enableProject(project: TrackedProjectData) {
        return this.projectRepository.enableProject(project)
    }

    public disableProject(project: TrackedProjectData) {
        return this.projectRepository.disableProject(project)
    }

    public setProjectIncludeBuildJobs(project: TrackedProjectData, value: boolean) {
        return this.projectRepository.setProjectIncludeBuildJobs(project, value)
    }

    public setProjectHiddenJobs(project: TrackedProjectData, hiddenJobs: string[]): void {
        return this.projectRepository.setProjectHiddenJobs(project, hiddenJobs)
    }

    public setProjectCollapsed(project: TrackedProjectData, collapsed: boolean): void {
        return this.projectRepository.setProjectCollapsed(project, collapsed)
    }

    public loadTrackedProjects(): TrackedProjectData[] {
        return this.projectRepository.loadTrackedProjects() || []
    }

    public loadProject(project: TrackedProjectData | ProjectData): ProjectData | undefined {
        return this.projectRepository.loadProject(project)
    }

    public reorderProjects(orderedNonExcluded: TrackedProjectData[]): void {
        return this.projectRepository.reorderProjects(orderedNonExcluded)
    }

    public excludeProject(project: TrackedProjectData): void {
        return this.projectRepository.excludeProject(project)
    }

    public unexcludeAllProjects(): void {
        return this.projectRepository.unexcludeAllProjects()
    }

    public async syncProject(project: TrackedProjectData | ProjectData): Promise<ProjectData> {
        const existingData = this.projectRepository.loadProject(project)
        const result: ProjectData = {
            vcsType: project.vcsType,
            reponame: project.reponame,
            username: project.username,
            vcsUrl: project.vcsUrl,
            ciUrl: `https://app.circleci.com/pipelines/${project.vcsType}/${project.username}/${project.reponame}`,
            defaultBranch: project.defaultBranch,
            lastSyncedAt: new Date().toISOString(),
            workflows: await new WorkflowFetcher(project, existingData?.workflows).getProjectWorkflows(),
        }

        this.projectRepository.persistProject(result)
        emitProjectSynched({ project: result })
        return result
    }
}
