import { JobDetailsResponse } from './models/JobDetailsResponse'
import { ListPipelineWorkflowsResponse } from './models/ListPipelineWorkflowsResponse'
import { ListProjectPipelinesReponse } from './models/ListProjectPipelinesResponse'
import { ListUserProjectsResponse } from './models/ListUserProjectsResponse'
import { ListWorkflowJobsResponse } from './models/ListWorkflowJobsResponse'
import { ListWorkflowRecentRunsResponse } from './models/ListWorkflowRecentRunsResponse'
import { UserInformationResponse } from './models/UserInformationResponse'

const apiV1 = 'https://circleci.com/api/v1.1'
const apiV2 = 'https://circleci.com/api/v2'

export let circleCiClient: CircleCiClient

export const initializeCircleCiClient = (apiToken: string): CircleCiClient => {
    return (circleCiClient = new CircleCiClient(apiToken))
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
        versionControlSlug: string,
        organization: string,
        repository: string,
        branch: string
    ): Promise<ListProjectPipelinesReponse> {
        const url = `${apiV2}/project/${versionControlSlug}/${organization}/${repository}/pipeline?branch=${branch}&circle-token=${this.apiToken}`
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

    //Not every WorkflowJob has a number. This makes this url not viable. :/
    //And only returns well succeeded workflows? 
    public async getJobDetails(jobNumber: number, projectSlug: string): Promise<JobDetailsResponse> {
        const url = `${apiV2}/project/${projectSlug}/job/${jobNumber}`
        const response = await fetch(url, {
            headers: {
                Authorization: 'Basic ' + btoa(this.apiToken.concat(':')),
            },
        })
        return await response.json()
    }

    //Not every WorkflowJob has a number. This makes this url not viable. :/
    public async getJobDetailsV1(jobNumber: number, projectSlug: string): Promise<any> {
        //apiV1/project/projectSlug/${jobNumber}?circle-token=${this.apiToken}
        const url = `${apiV2}/project/${projectSlug}/job/${jobNumber}`
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
        versionControlSlug: string,
        organization: string,
        repository: string,
        workflowName: string
    ): Promise<ListWorkflowRecentRunsResponse> {
        const endDate = Date.now()
        const startDate = new Date(endDate - NINETY_DAYS)
        const queryString = `circle-token=${this.apiToken}&start-date=${startDate.toISOString()}&end-date=${new Date(endDate).toISOString()}`
        const url = `${apiV2}/insights/${versionControlSlug}/${organization}/${repository}/workflows/${workflowName}?${queryString}`
        const response = await fetch(url)
        return await response.json()
    }
}
