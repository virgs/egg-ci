export type JobDetailsResponse = {
    web_url: string
    project: Project
    parallel_runs: {
        index: string
        status: string
    }[]
    started_at: string
    latest_workflow: {
        id: string
        name: string
    }
    name: string
    executor: {
        rsource_class: string
        type?: string
    }
    parallelism: number
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
    number: number
    pipeline: {
        id: string
    }
    duration: number
    created_at: string
    messages: {
        type: string
        message: string
        reason: string
    }[]
    contexts: {
        name: string
    }[]
    organization: {
        name: string
    }
    queued_at: string
    stopped_at?: string
}

type Project = {
    id: string
    slug: string
    name: string
    external_url: string
}
