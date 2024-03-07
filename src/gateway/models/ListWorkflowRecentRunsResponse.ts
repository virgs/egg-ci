export type ListWorkflowRecentRunsResponse = {
    id: string
    branch: string
    duration: number
    created_at: string
    stopped_at: string
    credits_used: number
    status: 'success' | 'failed' | 'error' | 'canceled' | 'unauthorized'
    is_approval: boolean
}
