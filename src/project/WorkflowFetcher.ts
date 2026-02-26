import { Config } from '../config'
import { TrackedProjectData, ProjectData, JobData, WorkflowData } from '../domain-models/models'
import { circleCiClient } from '../gateway/CircleCiClient'
import { PipelineWorkflow } from '../gateway/models/ListPipelineWorkflowsResponse'
import { ProjectPipeline } from '../gateway/models/ListProjectPipelinesResponse'
import { WorkflowJob } from '../gateway/models/ListWorkflowJobsResponse'
import { SettingsRepository } from '../settings/SettingsRepository'
import { sleep } from '../time/Time'

type ProjectWorkflows = {
    [workflowName: string]: WorkflowData
}

const SETUP_WORKFLOW = 'setup'

export class WorkflowFetcher {
    private readonly project: TrackedProjectData | ProjectData
    private readonly config: Config
    private readonly projectWorkflows: ProjectWorkflows

    public constructor(project: TrackedProjectData | ProjectData) {
        this.project = project
        this.projectWorkflows = {}
        this.config = new SettingsRepository().getConfiguration()
    }

    private async listProjectPipelines(): Promise<ProjectPipeline[]> {
        const pipelines: ProjectPipeline[] = []
        let pageToken: string | undefined
        while (pipelines.length < this.config.minPipelineNumber) {
            const listPipelineResult = await circleCiClient.listProjectPipelines(
                this.project,
                this.project.defaultBranch,
                pageToken
            )
            pipelines.push(...listPipelineResult.items)
            if (!listPipelineResult.next_page_token) {
                break
            }
            pageToken = listPipelineResult.next_page_token
        }
        return pipelines
    }

    public async getProjectWorkflows(): Promise<ProjectWorkflows> {
        const pipelines: ProjectPipeline[] = await this.listProjectPipelines()
        const currentJobs: string[] = await this.listCurrentJobs(pipelines)

        await Promise.all(
            pipelines.map(async (pipeline) => {
                const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(pipeline.id)
                await Promise.all(
                    pipelineWorkflows.items
                        .filter(
                            (pipelineWorkflow) =>
                                pipelineWorkflow.name !== SETUP_WORKFLOW && pipelineWorkflow?.id?.length > 0
                        )
                        .map(async (pipelineWorkflow) => {
                            await sleep(this.config.pipelineWorkflowFetchSleepInMs) //avoids throttling
                            const workflowJobs = await circleCiClient.listWorkflowJobs(pipelineWorkflow.id)
                            await Promise.all(
                                workflowJobs.items
                                    .filter((workflowJob) => workflowJob.started_at)
                                    .filter((workflowJob) => currentJobs.includes(workflowJob.name))
                                    .map(async (workflowJob) => {
                                        this.insertJob(workflowJob, pipelineWorkflow, pipeline)
                                    })
                            )
                        })
                )
            })
        )

        this.sortAndFilterJobs()

        return this.projectWorkflows
    }

    private insertJob(workflowJob: WorkflowJob, pipelineWorkflow: PipelineWorkflow, pipeline: ProjectPipeline) {
        const workflowName = pipelineWorkflow.name
        const workflow = this.projectWorkflows[workflowName]
        const jobData: JobData = {
            ...workflowJob,
            pipeline: pipeline,
            workflow: pipelineWorkflow,
        }
        if (workflow) {
            if (workflow.latestBuildNumber < pipelineWorkflow.pipeline_number) {
                workflow.latestBuildNumber = pipelineWorkflow.pipeline_number
                workflow.latestId = pipelineWorkflow.id
            }
            workflow.jobs.find((item) => item.name === workflowJob.name)?.history.push(jobData) ??
                workflow.jobs.push({
                    name: workflowJob.name,
                    history: [jobData],
                })
        } else {
            this.projectWorkflows[workflowName] = {
                name: workflowName,
                latestBuildNumber: pipelineWorkflow.pipeline_number,
                latestId: pipelineWorkflow.id,
                jobs: [
                    {
                        name: workflowJob.name,
                        history: [jobData],
                    },
                ],
            }
        }
    }

    private sortAndFilterJobs() {
        Object.keys(this.projectWorkflows).forEach((workflowName) => {
            this.projectWorkflows[workflowName].jobs.map(
                (job) =>
                    (job.history = job.history
                        .sort((a, b) => new Date(b.started_at!).getTime() - new Date(a.started_at!).getTime())
                        .filter((_, index) => index < this.config.jobExecutionsMaxHistory))
            )
        })
    }

    private async listCurrentJobs(pipelines: ProjectPipeline[]): Promise<string[]> {
        const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(pipelines[0].id)
        const eligibleWorkflows = pipelineWorkflows.items.filter(
            (pipelineWorkflow) => pipelineWorkflow.name !== SETUP_WORKFLOW && pipelineWorkflow?.id?.length > 0
        )
        const jobNameArrays = await Promise.all(
            eligibleWorkflows.map(async (workflow) => {
                const workflowJobs = await circleCiClient.listWorkflowJobs(workflow.id)
                return workflowJobs.items
                    .filter((workflowJob) => this.config.includeBuildJobs || workflowJob.type === 'approval')
                    .map((job) => job.name)
            })
        )
        return [...new Set(jobNameArrays.flat())]
    }
}
