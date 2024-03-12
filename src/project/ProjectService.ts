import { DashboardRepository } from '../dashboard/DashboardRepository'
import { JobData, ProjectData, TrackedProjectData } from '../domain-models/models'
import { emitProjectSynched } from '../events/Events'
import { circleCiClient } from '../gateway/CircleCiClient'
import { getVersionControlSlug, mapVersionControlFromString } from '../version-control/VersionControl'

const SETUP_WORKFLOW = 'setup'

export class ProjectService {
    private readonly dashboardRepository = new DashboardRepository()

    public async listUserProjects(): Promise<TrackedProjectData[]> {
        const userProjects = await circleCiClient.listUserProjects()
        return await Promise.all(
            userProjects
                .map(async (project) => ({
                    enabled: false,
                    vcsType: project.vcs_type,
                    reponame: project.reponame,
                    username: project.username,
                    defaultBranch: project.default_branch,
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

    public loadProject(project: TrackedProjectData): ProjectData | undefined {
        return this.dashboardRepository.loadProject(project)
    }

    public async syncProject(project: TrackedProjectData): Promise<ProjectData> {
        const result: ProjectData = {
            vcsType: project.vcsType,
            reponame: project.reponame,
            username: project.username,
            vcsUrl: project.vcsUrl,
            defaultBranch: project.defaultBranch,
            workflows: {}
        };
        const jobs = await circleCiClient.listProjectJobs(getVersionControlSlug(mapVersionControlFromString(project.vcsType)!),
            project.username,
            project.reponame,
            project.defaultBranch);

        jobs
            // .filter(job => job.workflows.workflow_name !== SETUP_WORKFLOW)
            .forEach(job => {
                const workflowName = job.workflows.workflow_name;
                if (result.workflows[workflowName]) {
                    const existingJob = result.workflows[workflowName].jobs.find(item => item.name === job.workflows.job_name)
                    if (existingJob) {
                        existingJob.history.push(job)
                    } else {
                        result.workflows[workflowName].jobs.push({
                            name: job.workflows.job_name,
                            history: [job]
                        })
                    }
                } else {
                    result.workflows[workflowName] = {
                        name: workflowName,
                        mostRecentBuild: job.build_num,
                        mostRecentId: job.workflows.workflow_id,
                        jobs: [{
                            name: job.workflows.job_name,
                            history: [job]
                        }]
                    }
                }
            })

        console.log(result)
        this.dashboardRepository.persistProject(result)
        emitProjectSynched({ project: result })
        return result
    }

    // public async syncProjectData(project: ProjectConfiguration) {
    //     console.log('syncProjectData', project.reponame)
    //     await Promise.all(project.workflows.map((workflow) => this.syncWorkflow(workflow, project)))
    // }

    // private async syncWorkflow(workflowName: string, project: ProjectConfiguration): Promise<void> {
    //     const pipelines = await circleCiClient.listProjectPipelines(
    //         getVersionControlSlug(mapVersionControlFromString(project.vcsType)!),
    //         project.username,
    //         project.reponame,
    //         project.defaultBranch
    //     )
    //     //sort pipelines in a way that the most recent is the first item (by updated_at attribute)

    //     // if (pipelines.items.length === 0) {
    //     //     return
    //     // }
    //     const mostRecentPipeline = pipelines.items[0]
    //     //TODO compare against the most recent persisted pipele to check which ones are new
    //     //To make it simpler, we'll need to go through the pipeline.item in the reverse order

    //     const jobsMap = await this.initializePipelineJobsMap(mostRecentPipeline)
    //     let mostRecentWorkflow: PipelineWorkflow | undefined

    //     for (let pipeline of pipelines.items) {
    //         const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(pipeline.id)
    //         //TODO there can be multiple workflows with the same name in the same pipeline (when it reruns, for example)
    //         const workflow = pipelineWorkflows.items.find((pipelineWorkflow) => pipelineWorkflow.name === workflowName)
    //         if (!workflow) {
    //             break
    //         }
    //         if (mostRecentWorkflow === undefined) {
    //             mostRecentWorkflow = workflow
    //         }
    //         const workflowJobs = await circleCiClient.listWorkflowJobs(workflow.id)
    //         workflowJobs.items.forEach((workflowJob) =>
    //             jobsMap
    //                 .find((job) => job.name === workflowJob.name)
    //                 ?.executions.push({ ...workflowJob, pipeline: pipeline, workflow: workflow })
    //         )
    //     }

    //     const dashboardWorkflow: WorkflowData = {
    //         name: workflowName,
    //         project: project,
    //         mostRecentPipeline: mostRecentPipeline,
    //         mostRecentWorkflow: mostRecentWorkflow!,
    //         jobs: jobsMap.map((job) => ({
    //             name: job.name,
    //             hidden: false,
    //             executions: job.executions
    //                 .filter((execution) => execution.started_at !== undefined && execution.started_at?.length > 0)
    //                 .filter((_, index) => index < config.jobExecutionsMaxHistory),
    //         })),
    //     }

    //     const dashboardRepository = new DashboardRepository()
    //     dashboardRepository.persistWorkflow(dashboardWorkflow)
    //     emitWorkflowSynched({ project: project, workflowName: workflowName })
    // }

    // private async initializePipelineJobsMap(mostRecentPipeline: ProjectPipeline): Promise<JobData[]> {
    //     const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(mostRecentPipeline.id)
    //     if (pipelineWorkflows.items.length === 0) {
    //         return []
    //     }
    //     const mostRecentWorkflow = pipelineWorkflows.items[0]
    //     return (await this.listWorkflowJobsName(mostRecentWorkflow)).map((jobName) => ({
    //         name: jobName,
    //         hidden: false,
    //         executions: [],
    //         history: [],
    //     }))
    // }

    // private async listPipelineWorkflows(mostRecentPipeline: ProjectPipeline): Promise<string[]> {
    //     const workflowsDetails = await circleCiClient.listPipelineWorkflows(mostRecentPipeline.id)
    //     return Array.from(
    //         new Set(
    //             workflowsDetails.items
    //                 .filter((workflow) => workflow?.tag !== SETUP_WORKFLOW)
    //                 .map((workflow) => workflow.name)
    //         )
    //     )
    // }

    // private async listWorkflowJobsName(mostRecentWorkflow: PipelineWorkflow): Promise<string[]> {
    //     const jobsDetails = await circleCiClient.listWorkflowJobs(mostRecentWorkflow.id)
    //     return jobsDetails.items.map((workflow) => workflow.name)
    // }
}
