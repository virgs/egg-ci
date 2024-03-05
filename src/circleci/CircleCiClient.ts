
import { PipelinesReponse } from "./models/PipelinesResponse";
import { ProjectsResponse } from "./models/ProjectsResponse";

const apiV1 = "https://circleci.com/api/v1.1";
const apiV2 = "https://circleci.com/api/v2";

export class CircleCiClient {
    private readonly apiToken: string;
    public constructor(apiToken: string) {
        this.apiToken = apiToken
    }

    public async listProjects(): Promise<ProjectsResponse[]> {
        const url = `${apiV1}/projects?circle-token=${this.apiToken}`
        const response = await fetch(url);
        return await response.json();
    }

    public async listPipelines(projectSlug: string, branch?: string): Promise<PipelinesReponse> {
        //https://circleci.com/api/v2/project/gh/Jackinthebox-IT/store-data-hub-api/pipeline
        let url = `${apiV2}/project/${projectSlug}/pipeline?circle-token=${this.apiToken}`
        if (branch) {
            url += `?branch=${branch}`;
        }
        const response = await fetch(url);
        return await response.json();
    }

    // public async triggerPipelines(projectSlug: string): Promise<any[]> {
    //     return (await axios.post(`${v2BaseUrl}/project/${projectSlug}/pipeline`)).data;
    // }

    // public async getPipelineWorkflow(pipelineId: string): Promise<any[]> {
    //     return (await axios.get(`${v2BaseUrl}/pipeline/${pipelineId}/workflow`)).data;
    // }
}