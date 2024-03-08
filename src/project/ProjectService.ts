import { DashboardRepository, JobData, WorkflowData } from '../dashboard/DashboardRepository'
import { emitUserInformationChanged, emitWorkflowSynched } from '../events/Events'
import { circleCiClient } from '../gateway/CircleCiClient'
import { PipelineWorkflow } from '../gateway/models/ListPipelineWorkflowsResponse'
import { ProjectPipeline } from '../gateway/models/ListProjectPipelinesResponse'
import { getVersionControlSlug, mapVersionControlFromString } from '../version-control/VersionControl'
import { ProjectConfiguration } from './ProjectConfiguration'

const SETUP_WORKFLOW = 'setup'
const JOB_EXECUTIONS_MAX_HISTORY = 10

export class ProjectService {
    private readonly dashboardRepository = new DashboardRepository()

    public trackProject(project: ProjectConfiguration) {
        return this.dashboardRepository.trackProject(project)
    }

    public enableProject(project: ProjectConfiguration) {
        return this.dashboardRepository.enableProject(project)
    }

    public disableProject(project: ProjectConfiguration) {
        return this.dashboardRepository.disableProject(project)
    }

    public loadTrackedProjects(): ProjectConfiguration[] {
        return this.dashboardRepository.loadTrackedProjects()
    }

    public loadProjectWorkflows(project: ProjectConfiguration): (WorkflowData | undefined)[] {
        return project.workflows.map((workflow) => this.dashboardRepository.loadWorkflow(project, workflow))
    }

    public async syncProjectData(project: ProjectConfiguration) {
        console.log('syncProjectData', project.reponame)
        await Promise.all(project.workflows.map((workflow) => this.syncWorkflow(workflow, project)))
    }

    public async listProjectsConfigurations(): Promise<ProjectConfiguration[]> {
        const userProjects = await circleCiClient.listUserProjects()
        return await Promise.all(
            userProjects.map(async (project) => {
                const pipelines = await circleCiClient.listProjectPipelines(
                    getVersionControlSlug(mapVersionControlFromString(project.vcs_type)!),
                    project.username,
                    project.reponame,
                    project.default_branch
                )
                const mostRecentPipeline = pipelines.items[0]
                const projectConfiguration: ProjectConfiguration = {
                    enabled: false,
                    vcsType: project.vcs_type,
                    reponame: project.reponame,
                    username: project.username,
                    defaultBranch: project.default_branch,
                    workflows: mostRecentPipeline ? await this.listPipelineWorkflows(mostRecentPipeline) : [],
                }
                return projectConfiguration
            })
        )
    }

    private async syncWorkflow(workflowName: string, project: ProjectConfiguration): Promise<void> {
        const pipelines = await circleCiClient.listProjectPipelines(
            getVersionControlSlug(mapVersionControlFromString(project.vcsType)!),
            project.username,
            project.reponame,
            project.defaultBranch
        )
        // if (pipelines.items.length === 0) {
        //     return
        // }
        const mostRecentPipeline = pipelines.items[0]
        //TODO compare against the most recent persisted pipele to check which ones are new
        //To make it simpler, we'll need to go through the pipeline.item in the reverse order

        const jobsMap = await this.initializePipelineJobsMap(mostRecentPipeline)
        let mostRecentWorkflow: PipelineWorkflow | undefined

        for (let pipeline of pipelines.items) {
            const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(pipeline.id)
            const workflow = pipelineWorkflows.items.find((pipelineWorkflow) => pipelineWorkflow.name === workflowName)
            if (!workflow) {
                break
            }
            if (mostRecentWorkflow === undefined) {
                mostRecentWorkflow = workflow
            }
            const workflowJobs = await circleCiClient.listWorkflowJobs(workflow.id)
            workflowJobs.items.forEach((workflowJob) =>
                jobsMap
                    .find((job) => job.name === workflowJob.name)
                    ?.executions.push({ ...workflowJob, pipeline: pipeline, workflow: workflow })
            )
        }

        const dashboardWorkflow: WorkflowData = {
            name: workflowName,
            project: project,
            mostRecentPipeline: mostRecentPipeline,
            mostRecentWorkflow: mostRecentWorkflow!,
            jobs: jobsMap.map((job) => ({
                name: job.name,
                executions: job.executions
                    .filter((execution) => execution.started_at !== undefined && execution.started_at?.length > 0)
                    .filter((_, index) => index < JOB_EXECUTIONS_MAX_HISTORY),
            })),
        }

        const dashboardRepository = new DashboardRepository()
        dashboardRepository.persistWorkflow(dashboardWorkflow)
        emitWorkflowSynched({ project: project, workflowName: workflowName })
        console.log('synced')
    }

    private async initializePipelineJobsMap(mostRecentPipeline: ProjectPipeline): Promise<JobData[]> {
        const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(mostRecentPipeline.id)
        if (pipelineWorkflows.items.length === 0) {
            return []
        }
        return (await this.listWorkflowJobsName(pipelineWorkflows.items[0])).map((jobName) => ({
            name: jobName,
            executions: [],
            history: [],
        }))
    }

    private async listPipelineWorkflows(mostRecentPipeline: ProjectPipeline): Promise<string[]> {
        const workflowsDetails = await circleCiClient.listPipelineWorkflows(mostRecentPipeline.id)
        return workflowsDetails.items
            .filter((workflow) => workflow?.tag !== SETUP_WORKFLOW)
            .map((workflow) => workflow.name)
    }

    private async listWorkflowJobsName(mostRecentWorkflow: PipelineWorkflow): Promise<string[]> {
        const jobsDetails = await circleCiClient.listWorkflowJobs(mostRecentWorkflow.id)
        return jobsDetails.items.map((workflow) => workflow.name)
    }
}
