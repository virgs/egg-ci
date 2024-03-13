import { PipelineWorkflow } from "../gateway/models/ListPipelineWorkflowsResponse"
import { ProjectPipeline } from "../gateway/models/ListProjectPipelinesResponse"

export interface TrackedProjectData {
    enabled: boolean
    vcsType: string
    vcsUrl: string
    reponame: string
    username: string
    defaultBranch: string
}

export interface ProjectData {
    vcsUrl: string
    vcsType: string
    reponame: string
    username: string
    defaultBranch: string
    ciUrl: string;
    workflows: {
        [name: string]: WorkflowData
    }
}

export type JobContextData = {
    name: string
    history: JobData[]
}

export type WorkflowData = {
    name: string;
    latestBuildNumber: number;
    latestId: string;
    jobs: JobContextData[]
}

export type PipelineJobData = ProjectPipeline
export type WorkflowJobData = PipelineWorkflow

export type JobData = {
    workflow: WorkflowJobData
    pipeline: PipelineJobData

    canceled_by?: string
    dependencies: string[]
    job_number?: number
    id: string
    started_at?: string
    name: string
    approved_by?: string
    project_slug: string
    status:
    | 'success'
    | 'running'
    | 'not_run'
    | 'failed'
    | 'retried'
    | 'queued'
    | 'not_running'
    | 'infrastructure_fail'
    | 'timedout'
    | 'on_hold'
    | 'terminated-unknown'
    | 'blocked'
    | 'canceled'
    | 'unauthorized'
    type: 'build' | 'approval'
    stopped_at?: string
    approval_request_id?: string
}