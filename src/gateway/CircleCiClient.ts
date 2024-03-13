import { JobDetailsResponse } from './models/JobDetailsResponse'
import { ListPipelineWorkflowsResponse } from './models/ListPipelineWorkflowsResponse'
import { ListProjectPipelinesReponse } from './models/ListProjectPipelinesResponse'
import { ListProjectJobs as ListProjectJobs } from './models/ListProjectJobs'
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

    public async cancelJob(projectSlug: string,
        jobNumber: number): Promise<{ message: string }> {
        const url = `${apiV2}/project/${projectSlug}/job/${jobNumber}/cancel?circle-token=${this.apiToken}`
        return new Promise(async (resolve, reject) => {
            try {
                fetch(url, { method: 'POST' })
                    .then(response => {
                        console.log(response.json())
                        resolve({ message: 'ok' })
                    })
                    .catch(error => {
                        console.log(error)
                        reject(error)
                    })
            } catch (er) {
                console.log(er)
            }
        })
    }

    public async approveJob(workflowId: string,
        jobId: string): Promise<{ message: string }> {
        const url = `${apiV2}/workflow/${workflowId}/approve/${jobId}?circle-token=${this.apiToken}`
        const response = await fetch(url, { method: 'POST' })
        return await response.json()
    }

    public async rerunJob(workflowId: string,
        jobId: string): Promise<{ workflow_id: string }> {
        const url = `${apiV2}/workflow/${workflowId}/rerun?circle-token=${this.apiToken}`
        console.log(url)
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                enable_ssh: false,
                from_failed: false,
                jobs: [jobId],
                sparse_tree: false
            }),
        })
        return await response.json()
    }

    //Doesn't return approval jobs :()
    //https://circleci.com/docs/api/v1/index.html#recent-jobs-for-a-single-project
    public async listProjectJobs(versionControlSlug: string,
        organization: string,
        repository: string,
        branch: string): Promise<ListProjectJobs> {
        const url = `${apiV1}/project/${versionControlSlug}/${organization}/${repository}/tree/${branch}?limit=100&circle-token=${this.apiToken}`
        console.log(url)
        const response = await fetch(url)
        return await response.json()
    }

    public async getJobDetails(jobNumber: number, projectSlug: string): Promise<JobDetailsResponse> {
        const url = `${apiV2}/project/${projectSlug}/job/${jobNumber}`
        const response = await fetch(url, {
            headers: {
                Authorization: 'Basic ' + btoa(this.apiToken.concat(':')),
            },
        })
        return await response.json()
    }

    public async getJobDetailsV1(jobNumber: number, projectSlug: string): Promise<any> {
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
