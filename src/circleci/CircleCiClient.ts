
import { ListPipelineWorkflowsResponse } from "./models/ListPipelineWorkflowsResponse";
import { ListProjectPipelinesReponse } from "./models/ListProjectPipelinesResponse";
import { ListUserProjectsResponse } from "./models/ListUserProjectsResponse";

const apiV1 = "https://circleci.com/api/v1.1";
const apiV2 = "https://circleci.com/api/v2";

export let circleCiClient: CircleCiClient;

export const initializeCircleCiClient = (apiToken: string): CircleCiClient => {
    circleCiClient = new CircleCiClient(apiToken)
    return circleCiClient;
}

export class CircleCiClient {
    private readonly apiToken: string;
    public constructor(apiToken: string) {
        this.apiToken = apiToken
    }

    public async listProjects(): Promise<ListUserProjectsResponse[]> {
        const url = `${apiV1}/projects?circle-token=${this.apiToken}`
        const response = await fetch(url);
        return await response.json();
    }

    public async listPipelines(projectSlug: string, branch?: string): Promise<ListProjectPipelinesReponse> {
        //https://circleci.com/api/v2/project/gh/Jackinthebox-IT/store-data-hub-api/pipeline
        let url = `${apiV2}/project/${projectSlug}/pipeline?circle-token=${this.apiToken}`
        if (branch) {
            url += `?branch=${branch}`;
        }
        const response = await fetch(url);
        return await response.json();
    }

    public async listPipelineWorkflows(pipelineId: string): Promise<ListPipelineWorkflowsResponse[]> {
        const url = `${apiV2}/pipeline/${pipelineId}/workflow?circle-token=${this.apiToken}`
        const response = await fetch(url);
        return await response.json();
    }
}