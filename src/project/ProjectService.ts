import { config } from '../config'
import { DashboardRepository } from '../dashboard/DashboardRepository'
import { JobData, ProjectData, TrackedProjectData, WorkflowData } from '../domain-models/models'
import { emitProjectSynched } from '../events/Events'
import { circleCiClient } from '../gateway/CircleCiClient'
import { ListProjectPipelinesReponse } from '../gateway/models/ListProjectPipelinesResponse'
import { hash } from '../math/math'

type ProjectWorkflows = {
    [workflowName: string]: WorkflowData
}

const SETUP_WORKFLOW = 'setup'

export class ProjectService {
    private readonly dashboardRepository = new DashboardRepository()

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
        return this.dashboardRepository.trackProject(project)
    }

    public enableProject(project: TrackedProjectData) {
        return this.dashboardRepository.enableProject(project)
    }

    public disableProject(project: TrackedProjectData) {
        return this.dashboardRepository.disableProject(project)
    }

    public loadTrackedProjects(): TrackedProjectData[] {
        return this.dashboardRepository.loadTrackedProjects()
    }

    public loadProject(project: TrackedProjectData | ProjectData): ProjectData | undefined {
        return this.dashboardRepository.loadProject(project)
    }

    public async syncProject(project: TrackedProjectData | ProjectData): Promise<ProjectData> {
        const pipelines = await circleCiClient.listProjectPipelines(project, project.defaultBranch)
        //The idea was to check change by checking if the pipelines have changed
        //Turns out when a job change in a pipeline, the pipeline doesn't changed. :/
        const pipelineHash = await hash(JSON.stringify(pipelines))

        const result: ProjectData = {
            vcsType: project.vcsType,
            reponame: project.reponame,
            username: project.username,
            vcsUrl: project.vcsUrl,
            ciUrl: `https://app.circleci.com/pipelines/${project.vcsType}/${project.username}/${project.reponame}`,
            defaultBranch: project.defaultBranch,
            workflows: this.removeObsoleteJobs(await this.getProjectWorkflows(pipelines)),
            pipelineHash: pipelineHash,
        }

        Object.keys(result.workflows).forEach((workflowName) => {
            result.workflows[workflowName].jobs.map(
                (job) =>
                (job.history = job.history
                    .sort((a, b) => new Date(b.started_at!).getTime() - new Date(a.started_at!).getTime())
                    .filter((_, index) => index < config.jobExecutionsMaxHistory))
            )
        })

        this.dashboardRepository.persistProject(result)
        emitProjectSynched({ project: result })
        return result
    }
    private removeObsoleteJobs(workflows: ProjectWorkflows): ProjectWorkflows {
        return Object.keys(workflows).reduce((acc, workflowName) => {
            const workflow = workflows[workflowName]
            //Work on that to remove obsolete jobs, but not to remove current ones that haven't ran on the last pipeline

            // workflow.jobs = workflow.jobs.filter((job) =>
            //     job.history.some((historyItem) => historyItem.workflow.id === workflow.latestId)
            // )
            acc[workflowName] = workflow
            return acc
        }, {} as ProjectWorkflows)
    }

    private async getProjectWorkflows(pipelines: ListProjectPipelinesReponse): Promise<ProjectWorkflows> {
        const projectJobs: ProjectWorkflows = {}

        await Promise.all(
            pipelines.items.map(async (pipeline) => {
                const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(pipeline.id)
                await Promise.all(
                    pipelineWorkflows.items
                        .filter((pipelineWorkflow) =>
                            pipelineWorkflow.name !== SETUP_WORKFLOW && pipelineWorkflow?.id?.length > 0)
                        .map(async (pipelineWorkflow) => {
                            const workflowJobs = await circleCiClient.listWorkflowJobs(pipelineWorkflow.id)
                            await Promise.all(
                                workflowJobs.items
                                    .filter((workflowJob) => workflowJob.started_at)
                                    .map(async (workflowJob) => {
                                        const workflowName = pipelineWorkflow.name
                                        const workflow = projectJobs[workflowName]
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
                                            workflow.jobs
                                                .find((item) => item.name === workflowJob.name)
                                                ?.history.push(jobData) ??
                                                workflow.jobs.push({
                                                    name: workflowJob.name,
                                                    history: [jobData],
                                                })
                                        } else {
                                            projectJobs[workflowName] = {
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
                                    })
                            )
                        })
                )
            })
        )
        return projectJobs
    }
}
