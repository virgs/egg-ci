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

    /*
    Cancel job    
const options = {
  method: 'POST',
  url: 'https://circleci.com/api/v2/project/gh/CircleCI-Public/api-preview-docs/job/123/cancel',
  headers: {authorization: 'Basic REPLACE_BASIC_AUTH'}
};


Approve:
const options = {
  method: 'POST',
  //https://circleci.com/api/v2/workflow/{workflow-id}/approve/{job-id}
  url: 'https://circleci.com/api/v2/workflow/5034460f-c7c4-4c43-9457-de07e2029e7b/approve/%7Bapproval_request_id%7D',
  headers: {authorization: 'Basic REPLACE_BASIC_AUTH'}
};


Rerun job:
const request = require('request');

const options = {
  method: 'POST',
  url: 'https://circleci.com/api/v2/workflow/5034460f-c7c4-4c43-9457-de07e2029e7b/rerun',
  headers: {'content-type': 'application/json', authorization: 'Basic REPLACE_BASIC_AUTH'},
  body: {
    enable_ssh: false,
    from_failed: false,
    jobs: ['c65b68ef-e73b-4bf2-be9a-7a322a9df150', '5e957edd-5e8c-4985-9178-5d0d69561822'],
    sparse_tree: false
  },
  json: true
};

*/

    //https://circleci.com/docs/api/v1/index.html#recent-jobs-for-a-single-project
    public async listProjectJobs(versionControlSlug: string,
        organization: string,
        repository: string,
        branch: string): Promise<ListProjectJobs> {
        //api:     https://circleci.com/api/v1.1/project/:vcs-type/:username/:project?limit=20&offset=5&filter=completed
        //postman:  https://circleci.com/api/v1.1/project/github/Jackinthebox-IT/pos-reporting-core/tree/main?limit=100&circle-token=...
        // console: https://circleci.com/api/v1.1/project/github/Jackinthebox-IT/pos-reporting-core/tree/main?limit=100&circle-token=...
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
