export type ListProjectJobs = RecentJob[]

type RecentJob = {
    build_url: string
    failed: boolean
    branch: string
    vcs_revision: string
    subject: string
    user: {
        login: string
        avatar_url: string
        name: string
    }
    workflows: {
        workflow_id: string
        workflow_name: string
        job_name: string
        job_id: string
    }
    build_num: number
    messages: any[]
    start_time: string
    stop_time: string
    build_time_millis: number
    status:
        | 'retried'
        | 'canceled'
        | 'infrastructure_fail'
        | 'timedout'
        | 'not_run'
        | 'running'
        | 'failed'
        | 'queued'
        | 'not_running'
        | 'no_tests'
        | 'fixed'
        | 'success'
    lifecycle: 'queued' | 'not_run' | 'not_running' | 'running' | 'finished'
    outcome: 'canceled' | 'infrastructure_fail' | 'timedout' | 'failed' | 'no_tests' | 'success'
    vcs_url: string
}
