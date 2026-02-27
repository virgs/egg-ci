import { Config } from '../config'
import { TrackedProjectData, ProjectData } from '../domain-models/models'
import { circleCiClient } from '../gateway/CircleCiClient'
import { ProjectPipeline } from '../gateway/models/ListProjectPipelinesResponse'

const SETUP_WORKFLOW = 'setup'

export class PipelineFetcher {
    private readonly project: TrackedProjectData | ProjectData
    private readonly config: Config

    public constructor(project: TrackedProjectData | ProjectData, config: Config) {
        this.project = project
        this.config = config
    }

    public async listProjectPipelines(): Promise<ProjectPipeline[]> {
        const pipelines: ProjectPipeline[] = []
        let pageToken: string | undefined
        while (pipelines.length < this.config.minPipelineNumber) {
            const result = await circleCiClient.listProjectPipelines(
                this.project,
                this.project.defaultBranch,
                pageToken
            )
            pipelines.push(...result.items)
            if (!result.next_page_token) break
            pageToken = result.next_page_token
        }
        return pipelines
    }

    public async listCurrentJobs(pipelines: ProjectPipeline[]): Promise<string[]> {
        const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(pipelines[0].id)
        const eligibleWorkflows = pipelineWorkflows.items.filter(
            (w) => w.name !== SETUP_WORKFLOW && w?.id?.length > 0
        )
        const includeBuildJobs = (this.project as TrackedProjectData).includeBuildJobs ?? true
        const jobNameArrays = await Promise.all(
            eligibleWorkflows.map(async (workflow) => {
                const workflowJobs = await circleCiClient.listWorkflowJobs(workflow.id)
                return workflowJobs.items
                    .filter((job) => includeBuildJobs || job.type === 'approval')
                    .map((job) => job.name)
            })
        )
        return [...new Set(jobNameArrays.flat())]
    }
}
