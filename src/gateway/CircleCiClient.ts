import { JobDetailsResponse } from './models/JobDetailsResponse'
import { ListPipelineWorkflowsResponse } from './models/ListPipelineWorkflowsResponse'
import { ListProjectPipelinesReponse } from './models/ListProjectPipelinesResponse'
import { ListProjectJobs as ListProjectJobs } from './models/ListProjectJobs'
import { ListUserProjectsResponse } from './models/ListUserProjectsResponse'
import { ListWorkflowJobsResponse } from './models/ListWorkflowJobsResponse'
import { ListWorkflowRecentRunsResponse } from './models/ListWorkflowRecentRunsResponse'
import { UserInformationResponse } from './models/UserInformationResponse'
import { ProjectData, TrackedProjectData } from '../domain-models/models'

const baseUrl = import.meta.env.DEV ? '' : 'https://circleci.com'
const apiV1 = `${baseUrl}/api/v1.1`
const apiV2 = `${baseUrl}/api/v2`

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

    private authHeaders(): HeadersInit {
        return { 'Circle-Token': this.apiToken }
    }

    private async getJson<T>(url: string, options?: RequestInit): Promise<T> {
        const response = await fetch(url, { ...options, headers: { ...this.authHeaders(), ...options?.headers } })
        if (!response.ok) throw new Error(`CircleCI API error ${response.status}: ${url}`)
        return response.json()
    }

    public async listUserProjects(): Promise<ListUserProjectsResponse[]> {
        const url = `${apiV1}/projects?circle-token=${this.apiToken}`
        const response = await fetch(url)
        if (!response.ok) throw new Error(`CircleCI API error ${response.status}: ${url}`)
        return response.json()
    }

    public async listProjectPipelines(
        project: TrackedProjectData | ProjectData,
        branch: string,
        pageToken?: string
    ): Promise<ListProjectPipelinesReponse> {
        let url = `${apiV2}/project/${getProjectSlug(project)}/pipeline?branch=${branch}`
        if (pageToken) {
            url += `&page-token=${pageToken}`
        }
        return this.getJson(url)
    }

    public async listPipelineWorkflows(pipelineId: string): Promise<ListPipelineWorkflowsResponse> {
        return this.getJson(`${apiV2}/pipeline/${pipelineId}/workflow`)
    }

    public async listWorkflowJobs(workflowId: string): Promise<ListWorkflowJobsResponse> {
        return this.getJson(`${apiV2}/workflow/${workflowId}/job`)
    }

    public async cancelJob(project: TrackedProjectData | ProjectData, jobNumber: number): Promise<boolean> {
        const url = `${apiV2}/project/${getProjectSlug(project)}/job/${jobNumber}/cancel`
        try {
            await fetch(url, { method: 'POST', mode: 'no-cors', headers: this.authHeaders() })
            return true
        } catch {
            return false
        }
    }

    public async rerunJob(workflowId: string, jobId: string): Promise<boolean> {
        const url = `${apiV2}/workflow/${workflowId}/rerun`
        const body = JSON.stringify({ jobs: [jobId] })
        try {
            await fetch(url, {
                method: 'POST',
                body: body,
                mode: 'no-cors',
                headers: this.authHeaders(),
            })
            return true
        } catch {
            return false
        }
    }

    public async approveJob(workflowId: string, jobId: string): Promise<boolean> {
        const url = `${apiV2}/workflow/${workflowId}/approve/${jobId}`
        try {
            await fetch(url, { method: 'POST', mode: 'no-cors', headers: this.authHeaders() })
            return true
        } catch {
            return false
        }
    }

    //Doesn't return approval jobs :()
    //https://circleci.com/docs/api/v1/index.html#recent-jobs-for-a-single-project
    public async listProjectJobs(project: TrackedProjectData | ProjectData, branch: string): Promise<ListProjectJobs> {
        const url = `${apiV1}/project/${getProjectSlug(project)}/tree/${branch}?limit=100&circle-token=${this.apiToken}`
        const response = await fetch(url)
        if (!response.ok) throw new Error(`CircleCI API error ${response.status}: ${url}`)
        return response.json()
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
        if (!response.ok) throw new Error(`CircleCI API error ${response.status}: ${url}`)
        return response.json()
    }

    public async getJobDetailsV1(project: TrackedProjectData | ProjectData, jobNumber: number): Promise<unknown> {
        const url = `${apiV2}/project/${getProjectSlug(project)}/job/${jobNumber}`
        const response = await fetch(url, {
            headers: {
                Authorization: 'Basic ' + btoa(this.apiToken.concat(':')),
            },
        })
        if (!response.ok) throw new Error(`CircleCI API error ${response.status}: ${url}`)
        return response.json()
    }

    public async getUserInformation(): Promise<UserInformationResponse> {
        return this.getJson(`${apiV2}/me`)
    }

    //Up to 90 days limitation :(
    public async listSuccessfulWorkflowRecentRuns(
        project: TrackedProjectData | ProjectData,
        workflowName: string
    ): Promise<ListWorkflowRecentRunsResponse> {
        const endDate = Date.now()
        const startDate = new Date(endDate - NINETY_DAYS)
        const queryString = `start-date=${startDate.toISOString()}&end-date=${new Date(endDate).toISOString()}`
        const url = `${apiV2}/insights/${getProjectSlug(project)}/workflows/${workflowName}?${queryString}`
        return this.getJson(url)
    }
}
