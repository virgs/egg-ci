import { Config } from '../config'
import { TrackedProjectData, ProjectData, JobData, WorkflowData, StoredPipelineRef, StoredWorkflowRef } from '../domain-models/models'
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
    private readonly existingPipelineUpdatedAt: Map<number, string>

    public constructor(project: TrackedProjectData | ProjectData, existingWorkflows?: ProjectWorkflows) {
        this.project = project
        this.config = new SettingsRepository().getConfiguration()
        this.projectWorkflows = existingWorkflows ? JSON.parse(JSON.stringify(existingWorkflows)) : {}
        this.existingPipelineUpdatedAt = this.buildExistingPipelineUpdatedAt()
    }

    private buildExistingPipelineUpdatedAt(): Map<number, string> {
        const map = new Map<number, string>()
        Object.values(this.projectWorkflows).forEach((workflow) => {
            workflow.jobs.forEach((job) => {
                job.history.forEach((entry) => {
                    const num = entry.workflow.pipeline_number
                    if (!map.has(num)) {
                        map.set(num, entry.pipeline.updated_at)
                    }
                })
            })
        })
        return map
    }

    private removeJobsForPipeline(pipelineNumber: number) {
        for (const workflowName of Object.keys(this.projectWorkflows)) {
            const workflow = this.projectWorkflows[workflowName]
            workflow.jobs = workflow.jobs
                .map((job) => ({
                    ...job,
                    history: job.history.filter((e) => e.workflow.pipeline_number !== pipelineNumber),
                }))
                .filter((job) => job.history.length > 0)
            if (workflow.jobs.length === 0) {
                delete this.projectWorkflows[workflowName]
            }
        }
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

        for (const pipeline of pipelines) {
            const storedUpdatedAt = this.existingPipelineUpdatedAt.get(pipeline.number)
            if (storedUpdatedAt !== undefined && storedUpdatedAt === pipeline.updated_at) {
                continue // pipeline unchanged — skip expensive workflow/job fetches
            }
            if (storedUpdatedAt !== undefined) {
                // pipeline changed (e.g. a running job completed) — replace stale entries
                this.removeJobsForPipeline(pipeline.number)
            }

            const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(pipeline.id)
            for (const pipelineWorkflow of pipelineWorkflows.items.filter(
                (w) => w.name !== SETUP_WORKFLOW && w?.id?.length > 0
            )) {
                await sleep(this.config.pipelineWorkflowFetchSleepInMs) //avoids throttling
                const workflowJobs = await circleCiClient.listWorkflowJobs(pipelineWorkflow.id)
                const includeBuildJobs = (this.project as TrackedProjectData).includeBuildJobs ?? true
                workflowJobs.items
                    .filter((workflowJob) => workflowJob.started_at)
                    .filter((workflowJob) => includeBuildJobs || workflowJob.type !== 'build')
                    .filter((workflowJob) => currentJobs.includes(workflowJob.name))
                    .forEach((workflowJob) => this.insertJob(workflowJob, pipelineWorkflow, pipeline))
            }
        }

        this.sortAndFilterJobs()

        return this.projectWorkflows
    }

    private insertJob(workflowJob: WorkflowJob, pipelineWorkflow: PipelineWorkflow, pipeline: ProjectPipeline) {
        const workflowName = pipelineWorkflow.name
        const workflow = this.projectWorkflows[workflowName]

        const slimPipeline: StoredPipelineRef = {
            updated_at: pipeline.updated_at,
            trigger: {
                actor: {
                    login: pipeline.trigger.actor.login,
                    avatar_url: pipeline.trigger.actor.avatar_url,
                },
            },
            vcs: pipeline.vcs
                ? {
                      origin_repository_url: pipeline.vcs.origin_repository_url,
                      revision: pipeline.vcs.revision,
                      commit: pipeline.vcs.commit,
                  }
                : undefined,
        }

        const slimWorkflow: StoredWorkflowRef = {
            id: pipelineWorkflow.id,
            pipeline_id: pipelineWorkflow.pipeline_id,
            pipeline_number: pipelineWorkflow.pipeline_number,
        }

        const jobData: JobData = {
            ...workflowJob,
            pipeline: slimPipeline,
            workflow: slimWorkflow,
        }

        if (workflow) {
            if (workflow.latestBuildNumber < pipelineWorkflow.pipeline_number) {
                workflow.latestBuildNumber = pipelineWorkflow.pipeline_number
                workflow.latestId = pipelineWorkflow.id
            }
            const existingJob = workflow.jobs.find((item) => item.name === workflowJob.name)
            if (existingJob) {
                existingJob.history.push(jobData)
            } else {
                workflow.jobs.push({ name: workflowJob.name, history: [jobData] })
            }
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
        const includeBuildJobs = (this.project as TrackedProjectData).includeBuildJobs ?? true
        const jobNameArrays = await Promise.all(
            eligibleWorkflows.map(async (workflow) => {
                const workflowJobs = await circleCiClient.listWorkflowJobs(workflow.id)
                return workflowJobs.items
                    .filter((workflowJob) => includeBuildJobs || workflowJob.type === 'approval')
                    .map((job) => job.name)
            })
        )
        return [...new Set(jobNameArrays.flat())]
    }
}
