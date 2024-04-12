import { JobDetailsResponse } from './models/JobDetailsResponse'
import { ListPipelineWorkflowsResponse } from './models/ListPipelineWorkflowsResponse'
import { ListProjectPipelinesReponse } from './models/ListProjectPipelinesResponse'
import { ListProjectJobs as ListProjectJobs } from './models/ListProjectJobs'
import { ListUserProjectsResponse } from './models/ListUserProjectsResponse'
import { ListWorkflowJobsResponse } from './models/ListWorkflowJobsResponse'
import { ListWorkflowRecentRunsResponse } from './models/ListWorkflowRecentRunsResponse'
import { UserInformationResponse } from './models/UserInformationResponse'
import { ProjectData, TrackedProjectData } from '../domain-models/models'

const apiV1 = 'https://circleci.com/api/v1.1'
const apiV2 = 'https://circleci.com/api/v2'

export let circleCiClient: CircleCiClient

export const initializeCircleCiClient = (apiToken: string): CircleCiClient => {
    return (circleCiClient = new CircleCiClient(apiToken))
}

const getProjectSlug = (project: TrackedProjectData | ProjectData): string => {
    return `${project.vcsType}/${project.username}/${project.reponame}`
}

const NINETY_DAYS = 1000 * 3600 * 24 * 90

export class CircleCiClient {
    private readonly apiToken: string
    public constructor(apiToken: string) {
        this.apiToken = apiToken
    }

    public async listUserProjects(): Promise<ListUserProjectsResponse[]> {
        const url = `${apiV1}/projects?circle-token=${this.apiToken}`
        const response = await fetch(url)
        return await response.json()
    }

    public async listProjectPipelines(
        project: TrackedProjectData | ProjectData,
        branch: string,
        pageToken?: string
    ): Promise<ListProjectPipelinesReponse> {
        let url = `${apiV2}/project/${getProjectSlug(project)}/pipeline?branch=${branch}&circle-token=${this.apiToken}`
        if (pageToken) {
            url += `&page-token=${pageToken}`
        }
        const response = await fetch(url)
        return await response.json()
    }

    public async listPipelineWorkflows(pipelineId: string): Promise<ListPipelineWorkflowsResponse> {
        const url = `${apiV2}/pipeline/${pipelineId}/workflow?circle-token=${this.apiToken}`
        const response = await fetch(url)
        return await response.json()
    }

    public async listWorkflowJobs(workflowId: string): Promise<ListWorkflowJobsResponse> {
        const url = `${apiV2}/workflow/${workflowId}/job?circle-token=${this.apiToken}`
        const response = await fetch(url)
        return await response.json()
    }

    public async cancelJob(project: TrackedProjectData | ProjectData, jobNumber: number): Promise<boolean> {
        const url = `${apiV2}/project/${getProjectSlug(project)}/job/${jobNumber}/cancel?circle-token=${this.apiToken}`
        try {
            await fetch(url, { method: 'POST', mode: 'no-cors' })
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public async rerunJob(workflowId: string, jobId: string): Promise<boolean> {
        const url = `${apiV2}/workflow/${workflowId}/rerun?circle-token=${this.apiToken}`
        const body = JSON.stringify({
            jobs: [jobId],
        })
        console.log(url, jobId, body)
        try {
            await fetch(url, {
                method: 'POST',
                body: body,
                mode: 'no-cors',
            })
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    public async approveJob(workflowId: string, jobId: string): Promise<boolean> {
        const url = `${apiV2}/workflow/${workflowId}/approve/${jobId}?circle-token=${this.apiToken}`
        try {
            await fetch(url, { method: 'POST', mode: 'no-cors' })
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    //Doesn't return approval jobs :()
    //https://circleci.com/docs/api/v1/index.html#recent-jobs-for-a-single-project
    public async listProjectJobs(project: TrackedProjectData | ProjectData, branch: string): Promise<ListProjectJobs> {
        const url = `${apiV1}/project/${getProjectSlug(project)}/tree/${branch}?limit=100&circle-token=${this.apiToken}`
        console.log(url)
        const response = await fetch(url)
        return await response.json()
    }

    public async getJobDetails(
        project: TrackedProjectData | ProjectData,
        jobNumber: number
    ): Promise<JobDetailsResponse> {
        const url = `${apiV2}/project/${getProjectSlug(project)}/job/${jobNumber}`
        const response = await fetch(url, {
            headers: {
                Authorization: 'Basic ' + btoa(this.apiToken.concat(':')),
            },
        })
        return await response.json()
    }

    public async getJobDetailsV1(project: TrackedProjectData | ProjectData, jobNumber: number): Promise<any> {
        const url = `${apiV2}/project/${getProjectSlug(project)}/job/${jobNumber}`
        const response = await fetch(url, {
            headers: {
                Authorization: 'Basic ' + btoa(this.apiToken.concat(':')),
            },
        })
        return await response.json()
    }

    public async getUserInformation(): Promise<UserInformationResponse> {
        const url = `${apiV2}/me?circle-token=${this.apiToken}`
        const response = await fetch(url)
        return await response.json()
    }

    //Up to 90 days limitation :(
    public async listSuccessfulWorkflowRecentRuns(
        project: TrackedProjectData | ProjectData,
        workflowName: string
    ): Promise<ListWorkflowRecentRunsResponse> {
        const endDate = Date.now()
        const startDate = new Date(endDate - NINETY_DAYS)
        const queryString = `circle-token=${this.apiToken}&start-date=${startDate.toISOString()}&end-date=${new Date(endDate).toISOString()}`
        const url = `${apiV2}/insights/${getProjectSlug(project)}/workflows/${workflowName}?${queryString}`
        const response = await fetch(url)
        return await response.json()
    }
}
