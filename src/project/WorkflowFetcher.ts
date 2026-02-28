import { Config } from '../config'
import { TrackedProjectData, ProjectData, JobData, WorkflowData, StoredPipelineRef, StoredWorkflowRef } from '../domain-models/models'
import { circleCiClient } from '../gateway/CircleCiClient'
import { PipelineWorkflow } from '../gateway/models/ListPipelineWorkflowsResponse'
import { ProjectPipeline } from '../gateway/models/ListProjectPipelinesResponse'
import { WorkflowJob } from '../gateway/models/ListWorkflowJobsResponse'
import { SettingsRepository } from '../settings/SettingsRepository'
import { sleep } from '../time/Time'
import { PipelineFetcher } from './PipelineFetcher'

type ProjectWorkflows = {
    [workflowName: string]: WorkflowData
}

const SETUP_WORKFLOW = 'setup'

const buildSlimPipeline = (pipeline: ProjectPipeline): StoredPipelineRef => ({
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
})

const buildSlimWorkflow = (pipelineWorkflow: PipelineWorkflow): StoredWorkflowRef => ({
    id: pipelineWorkflow.id,
    pipeline_id: pipelineWorkflow.pipeline_id,
    pipeline_number: pipelineWorkflow.pipeline_number,
})

export class WorkflowFetcher {
    private readonly project: TrackedProjectData | ProjectData
    private readonly config: Config
    private readonly projectWorkflows: ProjectWorkflows
    private readonly existingPipelineUpdatedAt: Map<number, string>
    private readonly existingWorkflowIds: Map<number, Set<string>>
    private static readonly ACTIVE_JOB_STATUSES: ReadonlySet<string> = new Set(['running', 'on_hold', 'blocked', 'queued'])

    public constructor(project: TrackedProjectData | ProjectData, existingWorkflows?: ProjectWorkflows) {
        this.project = project
        this.config = new SettingsRepository().getConfiguration()
        this.projectWorkflows = existingWorkflows ? JSON.parse(JSON.stringify(existingWorkflows)) : {}
        this.existingPipelineUpdatedAt = this.buildExistingPipelineUpdatedAt()
        this.existingWorkflowIds = this.buildExistingWorkflowIds()
    }

    private buildExistingPipelineUpdatedAt(): Map<number, string> {
        const map = new Map<number, string>()
        Object.values(this.projectWorkflows).forEach((workflow) => {
            workflow.jobs.forEach((job) => {
                job.history.forEach((entry) => {
                    const num = entry.workflow.pipeline_number
                    if (!map.has(num)) map.set(num, entry.pipeline.updated_at)
                })
            })
        })
        return map
    }

    private buildExistingWorkflowIds(): Map<number, Set<string>> {
        const map = new Map<number, Set<string>>()
        Object.values(this.projectWorkflows).forEach((workflow) => {
            workflow.jobs.forEach((job) => {
                job.history.forEach((entry) => {
                    const num = entry.workflow.pipeline_number
                    if (!map.has(num)) map.set(num, new Set())
                    map.get(num)!.add(entry.workflow.id)
                })
            })
        })
        return map
    }

    private hasActiveJobs(pipelineNumber: number): boolean {
        return Object.values(this.projectWorkflows).some((workflow) =>
            workflow.jobs.some((job) =>
                job.history.some(
                    (entry) =>
                        entry.workflow.pipeline_number === pipelineNumber &&
                        WorkflowFetcher.ACTIVE_JOB_STATUSES.has(entry.status)
                )
            )
        )
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
            if (workflow.jobs.length === 0) delete this.projectWorkflows[workflowName]
        }
    }

    private insertJob(workflowJob: WorkflowJob, pipelineWorkflow: PipelineWorkflow, pipeline: ProjectPipeline) {
        const workflowName = pipelineWorkflow.name
        const jobData: JobData = {
            ...workflowJob,
            pipeline: buildSlimPipeline(pipeline),
            workflow: buildSlimWorkflow(pipelineWorkflow),
        }
        const workflow = this.projectWorkflows[workflowName]
        if (workflow) {
            if (workflow.latestBuildNumber < pipelineWorkflow.pipeline_number) {
                workflow.latestBuildNumber = pipelineWorkflow.pipeline_number
                workflow.latestId = pipelineWorkflow.id
            }
            const existing = workflow.jobs.find((item) => item.name === workflowJob.name)
            if (existing) {
                existing.history.push(jobData)
            } else {
                workflow.jobs.push({ name: workflowJob.name, history: [jobData] })
            }
        } else {
            this.projectWorkflows[workflowName] = {
                name: workflowName,
                latestBuildNumber: pipelineWorkflow.pipeline_number,
                latestId: pipelineWorkflow.id,
                jobs: [{ name: workflowJob.name, history: [jobData] }],
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

    public async getProjectWorkflows(): Promise<ProjectWorkflows> {
        const pipelineFetcher = new PipelineFetcher(this.project, this.config)
        const pipelines = await pipelineFetcher.listProjectPipelines()
        const currentJobs = await pipelineFetcher.listCurrentJobs(pipelines)
        const includeBuildJobs = (this.project as TrackedProjectData).includeBuildJobs ?? true

        for (const pipeline of pipelines) {
            const storedUpdatedAt = this.existingPipelineUpdatedAt.get(pipeline.number)
            const unchangedTimestamp = storedUpdatedAt !== undefined && storedUpdatedAt === pipeline.updated_at

            const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(pipeline.id)
            const relevantWorkflows = pipelineWorkflows.items.filter(
                (w) => w.name !== SETUP_WORKFLOW && w?.id?.length > 0
            )

            const existingIds = this.existingWorkflowIds.get(pipeline.number) ?? new Set<string>()
            const hasNewWorkflows = relevantWorkflows.some((w) => !existingIds.has(w.id))

            if (unchangedTimestamp && !this.hasActiveJobs(pipeline.number) && !hasNewWorkflows) continue
            if (storedUpdatedAt !== undefined) this.removeJobsForPipeline(pipeline.number)

            for (const pipelineWorkflow of relevantWorkflows) {
                await sleep(this.config.pipelineWorkflowFetchSleepInMs)
                const workflowJobs = await circleCiClient.listWorkflowJobs(pipelineWorkflow.id)
                workflowJobs.items
                    .filter((job) => job.started_at)
                    .filter((job) => includeBuildJobs || job.type !== 'build')
                    .filter((job) => currentJobs.includes(job.name))
                    .forEach((job) => this.insertJob(job, pipelineWorkflow, pipeline))
            }
        }

        this.sortAndFilterJobs()
        return this.projectWorkflows
    }
}
