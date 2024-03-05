import { circleCiClient } from "../gateway/CircleCiClient";
import { getVersionControlSlug, mapVersionControlFromString } from "../version-control/VersionControl";
import { Project } from "./Project";

const SETUP_WORKFLOW = 'setup';
export class ProjectService {
    public async sync(project: Project): Promise<void[]> {
        // console.log('syncing', project)
        const pipelines = await circleCiClient.listProjectPipelines(getVersionControlSlug(mapVersionControlFromString(project.vcs_type)!),
            project.username,
            project.reponame,
            project.branch)
        const mostRecentPipeline = pipelines.items[0];
        console.log(`${project.reponame} mostRecentPipeline: `, mostRecentPipeline)
        const mostRecentPipelineWorkflows = await circleCiClient.listPipelineWorkflows(mostRecentPipeline.id)
        const workflows: string[] = [...new Set(mostRecentPipelineWorkflows.items
            .filter(workflow => workflow?.tag !== SETUP_WORKFLOW)
            .map(workflow => workflow.name))]
        return await Promise.all(workflows
            .map(workflow => this.syncWorkflow(project, workflow)))



        // Promise.all(workflows
        //     .map(async workflowName => {
        //         const pipelineWorkflows = await circleCiClient.listPipelineWorkflows(pipeline.id)
        //         const pipelineRelevantWorkflows = pipelineWorkflows.items
        //             .filter(workflow => workflow?.tag !== SETUP_WORKFLOW)
        //             .map(w => console.log(w))
        //         // return pipelineRelevantWorkflows
        //         //     .map(workflow => this.syncWorkflow(workflow.name))
        //     }).flat())
    }

    public async syncWorkflow(project: Project, workflowName: string): Promise<void> {
        const recentRuns = await circleCiClient.listWorkflowRecentRuns(getVersionControlSlug(mapVersionControlFromString(project.vcs_type)!),
            project.username,
            project.reponame, workflowName)
        console.log(workflowName, recentRuns)
        // const workflows: (PipelineWorkflow & { jobs: WorkflowJob[] })[] = []

        // let currentJobNames: string[] = [];
        // // console.log('workflows', pipelineRelevantWorkflows)
        // //Every workflow will have its own dashboard section
        // //Rollback pipeline until all its jobs are success
        // const jobs = await circleCiClient.listWorkflowJobs(workflowId)

        // if (currentJobNames.length === 0) {
        //     currentJobNames.push(...jobs.items.map(job => job.name))
        // }

        // workflows.push({
        //     ...pipelineRelevantWorkflows[0],
        //     jobs: jobs.items
        // })
        // if (pipelineRelevantWorkflows.every(workflow => workflow.status === 'success')) {

        // }

        //found the latest workflow to run to the end
        //now remove the last job from the list and go backwar


    }
}
