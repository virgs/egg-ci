import axios from "axios";
import { ProjectsResponse } from "./models/ProjectsResponse";

const apiV1 = "https://circleci.com/api/v1.1";
const apiV2 = "https://circleci.com/api/v2";

const v1BaseUrl = import.meta.env.DEV ? '/v1/proxy' : apiV1
const v2BaseUrl = import.meta.env.DEV ? '/v2/proxy' : apiV2

export class CircleCiClient {
    public constructor(apiToken: string) {
        axios.defaults.headers.common['Circle-Token'] = apiToken;
    }

    public async listProjects(): Promise<ProjectsResponse[]> {
        return (await axios.get(`${v1BaseUrl}/projects`, { withCredentials: false })).data
    }

    public async listPipelines(projectSlug: string, branch?: string): Promise<any[]> {
        let url = `${v2BaseUrl}/project/${projectSlug}/pipeline`
        if (branch) {
            url += `?branch=${branch}`;
        }
        return (await axios.get(url)).data;
    }

    public async triggerPipelines(projectSlug: string): Promise<any[]> {
        return (await axios.post(`${v2BaseUrl}/project/${projectSlug}/pipeline`)).data;
    }

    public async getPipelineWorkflow(pipelineId: string): Promise<any[]> {
        return (await axios.get(`${v2BaseUrl}/pipeline/${pipelineId}/workflow`)).data;
    }
}