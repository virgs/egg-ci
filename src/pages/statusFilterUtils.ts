import { ALL_WORKFLOW_JOB_STATUSES, WorkflowJobStatus } from '../gateway/models/ListWorkflowJobsResponse'

export const ALL_JOB_STATUSES: ReadonlyArray<WorkflowJobStatus> = ALL_WORKFLOW_JOB_STATUSES

export type StatusCategory = {
    label: string
    statuses: WorkflowJobStatus[]
}

export const STATUS_CATEGORIES: StatusCategory[] = [
    { label: 'Successful', statuses: ['success'] },
    { label: 'In progress', statuses: ['running', 'queued'] },
    { label: 'Scheduled', statuses: ['on_hold', 'blocked', 'not_run'] },
    { label: 'Failed', statuses: ['failed', 'infrastructure_fail', 'timedout'] },
    { label: 'Canceled', statuses: ['canceled', 'terminated-unknown', 'unauthorized'] },
    { label: 'Retried', statuses: ['retried', 'not_running'] },
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

export const selectCategory = (
    current: WorkflowJobStatus[],
    category: StatusCategory
): WorkflowJobStatus[] => {
    const combined = new Set([...current, ...category.statuses])
    return [...combined]
}

export const isCategorySelected = (
    current: WorkflowJobStatus[],
    category: StatusCategory
): boolean => category.statuses.every((s) => current.includes(s))

