export type Config = {
    jobExecutionsMaxHistory: number
    jobHistoryColumnsPerLine: number
    autoSyncInterval: number
    minPipelineNumber: number
    pipelineWorkflowFetchSleepInMs: number
}

export const defaultConfig: Config = {
    jobExecutionsMaxHistory: 10,
    jobHistoryColumnsPerLine: 10,
    autoSyncInterval: 20 * 1000,
    minPipelineNumber: 10,
    pipelineWorkflowFetchSleepInMs: 200,
}
