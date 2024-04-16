export type Config = {
    jobExecutionsMaxHistory: number
    jobHistoryColumnsPerLine: number
    autoSyncInterval: number
    minPipelineNumber: number
    pipelineWorkflowFetchSleepInMs: number
    includeBuildJobs: boolean
}

export const defaultConfig: Config = {
    jobExecutionsMaxHistory: 10,
    jobHistoryColumnsPerLine: 5,
    autoSyncInterval: 20 * 1000,
    minPipelineNumber: 50,
    pipelineWorkflowFetchSleepInMs: 200,
    includeBuildJobs: false,
}
