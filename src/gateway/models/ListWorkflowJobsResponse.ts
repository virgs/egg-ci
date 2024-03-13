export type ListWorkflowJobsResponse = {
    items: WorkflowJob[]
    next_page_token: string
}

export type WorkflowJob = {
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
