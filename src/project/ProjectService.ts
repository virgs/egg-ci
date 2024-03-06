import { DashboardRepository, JobData, WorkflowData } from "../dashboard/DashboardRepository";
import { circleCiClient } from "../gateway/CircleCiClient";
import { PipelineWorkflow } from "../gateway/models/ListPipelineWorkflowsResponse";
import { ProjectPipeline } from "../gateway/models/ListProjectPipelinesResponse";
import { getVersionControlSlug, mapVersionControlFromString } from "../version-control/VersionControl";
import { ProjectConfiguration } from "./ProjectConfiguration";

const SETUP_WORKFLOW = 'setup';
const JOB_MAX_HISTORY = 5;

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

    public async syncProjectData(project: ProjectConfiguration) {
        console.log('syncing', project.reponame)
        await Promise.all(project.workflows
            .map(workflow => this.syncWorkflow(workflow, project)))
    }

    public async listProjectsConfigurations(): Promise<ProjectConfiguration[]> {
        const userProjects = await circleCiClient.listUserProjects()
        return await Promise.all(userProjects
            .map(async project => {
                const pipelines = await circleCiClient.listProjectPipelines(getVersionControlSlug(mapVersionControlFromString(project.vcs_type)!),
                    project.username,
                    project.reponame,
                    project.default_branch)
                const mostRecentPipeline = pipelines.items[0];
                const projectConfiguration: ProjectConfiguration = {
                    enabled: false,
                    vcsType: project.vcs_type,
                    reponame: project.reponame,
                    username: project.username,
                    defaultBranch: project.default_branch,
                    workflows: mostRecentPipeline ? await this.listPipelineWorkflows(mostRecentPipeline) : []
                }
                return projectConfiguration
            }))
    }

    private async syncWorkflow(workflowName: string, project: ProjectConfiguration): Promise<void> {
        const pipelines = await circleCiClient.listProjectPipelines(getVersionControlSlug(mapVersionControlFromString(project.vcsType)!),
            project.username,
            project.reponame,
            project.defaultBranch)
        if (pipelines.items.length === 0) {
            return
        }
        const mostRecentPipeline = pipelines.items[0];
        //TODO compare against the most recent persisted pipele to check which ones are new

        const jobsMap = await this.initializePipelineJobsMap(mostRecentPipeline)

        console.log('syncWorkflow', workflowName)

        for (let pipeline of pipelines.items) {
            const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(pipeline.id)
            const workflow = pipelineWorkflows.items
                .find(pipelineWorkflow => pipelineWorkflow.name === workflowName)
            if (!workflow) {
                break;
            }
            (await circleCiClient.listWorkflowJobs(workflow.id))
                .items
                .forEach(workflowJob => jobsMap
                    .find(job => job.name === workflowJob.name)
                    ?.executions.push(workflowJob));
            if (workflow.status === 'success') {
                break;
            }
        }

        const dashboardWorkflow: WorkflowData = {
            name: workflowName,
            project: project,
            mostRecentPipeline: mostRecentPipeline,
            jobs: jobsMap
        }

        const dashboardRepository = new DashboardRepository()
        dashboardRepository.persistWorkflow(dashboardWorkflow)
    }

    private async initializePipelineJobsMap(mostRecentPipeline: ProjectPipeline): Promise<JobData[]> {
        const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(mostRecentPipeline.id)
        if (pipelineWorkflows.items.length === 0) {
            return []
        }
        return (await this.listWorkflowJobs(pipelineWorkflows.items[0]))
            .map(jobName => ({
                name: jobName,
                executions: []
            }))
    }

    private async listPipelineWorkflows(mostRecentPipeline: ProjectPipeline): Promise<string[]> {
        const workflowsDetails = await circleCiClient.listPipelineWorkflows(mostRecentPipeline.id);
        return workflowsDetails.items
            .filter(workflow => workflow?.tag !== SETUP_WORKFLOW)
            .map(workflow => workflow.name);
    }

    private async listWorkflowJobs(mostRecentWorkflow: PipelineWorkflow): Promise<string[]> {
        const jobsDetails = await circleCiClient.listWorkflowJobs(mostRecentWorkflow.id);
        return jobsDetails.items
            .map(workflow => workflow.name);
    }

}
