import { WorkflowJobStatus } from '../gateway/models/ListWorkflowJobsResponse'

export const ALL_JOB_STATUSES: WorkflowJobStatus[] = [
    'success',
    'running',
    'not_run',
    'failed',
    'retried',
    'queued',
    'not_running',
    'infrastructure_fail',
    'timedout',
    'on_hold',
    'terminated-unknown',
    'blocked',
    'canceled',
    'unauthorized',
]

export const parseStatusFilters = (param: string | null): WorkflowJobStatus[] =>
    param === null ? [...ALL_JOB_STATUSES] : (param.split(',').filter(Boolean) as WorkflowJobStatus[])

export const serializeStatusFilters = (statuses: WorkflowJobStatus[]): string => statuses.join(',')

export const matchesStatusFilter = (latestStatus: string | undefined, filters: WorkflowJobStatus[]): boolean => {
    if (filters.length === ALL_JOB_STATUSES.length) return true
    if (filters.length === 0) return false
    if (!latestStatus) return true
    return filters.includes(latestStatus as WorkflowJobStatus)
}
