
import { ListPipelineWorkflowsResponse } from "./models/ListPipelineWorkflowsResponse";
import { ListProjectPipelinesReponse } from "./models/ListProjectPipelinesResponse";
import { ListUserProjectsResponse } from "./models/ListUserProjectsResponse";
import { ListWorkflowJobsResponse } from "./models/ListWorkflowJobsResponse";
import { ListWorkflowRecentRunsResponse } from "./models/ListWorkflowRecentRunsResponse";

const apiV1 = "https://circleci.com/api/v1.1";
const apiV2 = "https://circleci.com/api/v2";

export let circleCiClient: CircleCiClient;

export const initializeCircleCiClient = (apiToken: string): CircleCiClient => {
    return circleCiClient = new CircleCiClient(apiToken)
}

export class CircleCiClient {
    private readonly apiToken: string;
    public constructor(apiToken: string) {
        this.apiToken = apiToken
    }

    public async listUserProjects(): Promise<ListUserProjectsResponse[]> {
        const url = `${apiV1}/projects?circle-token=${this.apiToken}`
        const response = await fetch(url);
        return await response.json();
    }

    public async listProjectPipelines(versionControlSlug: string, organization: string, repository: string, branch: string):
        Promise<ListProjectPipelinesReponse> {
        let url = `${apiV2}/project/${versionControlSlug}/${organization}/${repository}/pipeline?branch=${branch}&circle-token=${this.apiToken}`
        const response = await fetch(url);
        return await response.json();
    }

    public async listPipelineWorkflows(pipelineId: string): Promise<ListPipelineWorkflowsResponse> {
        const url = `${apiV2}/pipeline/${pipelineId}/workflow?circle-token=${this.apiToken}`
        const response = await fetch(url);
        return await response.json();
    }

    public async listWorkflowJobs(workflowId: string): Promise<ListWorkflowJobsResponse> {
        const url = `${apiV2}/workflow/${workflowId}/job?circle-token=${this.apiToken}`
        const response = await fetch(url);
        return await response.json();
    }

    public async listWorkflowRecentRuns(versionControlSlug: string, organization: string, repository: string, workflowName: string): Promise<ListWorkflowRecentRunsResponse> {
        const url = `${apiV2}/insights/${versionControlSlug}/${organization}/${repository}/workflows/${workflowName}?circle-token=${this.apiToken}`
        const response = await fetch(url);
        return await response.json();
    }
}

