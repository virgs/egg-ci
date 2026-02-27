export interface TrackedProjectData {
    enabled: boolean
    vcsType: string
    vcsUrl: string
    reponame: string
    username: string
    defaultBranch: string
    includeBuildJobs?: boolean
    hiddenJobs?: string[]
    collapsed?: boolean
}

export interface ProjectData {
    vcsUrl: string
    vcsType: string
    reponame: string
    username: string
    defaultBranch: string
    ciUrl: string
    lastSyncedAt?: string
    workflows: {
        [name: string]: WorkflowData
    }
}

export type JobContextData = {
    name: string
    history: JobData[]
}

export type WorkflowData = {
    name: string
    latestBuildNumber: number
    latestId: string
    jobs: JobContextData[]
}

export type StoredPipelineRef = {
    updated_at: string
    trigger: {
        actor: {
            login: string
            avatar_url: string
        }
    }
    vcs?: {
        origin_repository_url: string
        revision: string
        commit?: {
            subject: string
            body: string
        }
    }
}

export type StoredWorkflowRef = {
    id: string
    pipeline_id: string
    pipeline_number: number
}

export type JobData = {
    workflow: StoredWorkflowRef
    pipeline: StoredPipelineRef

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
