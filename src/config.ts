export type Config = {
    jobExecutionsMaxHistory: number
    jobHistoryColumnsPerLine: number
    minPipelineNumber: number
    pipelineWorkflowFetchSleepInMs: number
}

export const defaultConfig: Config = {
    jobExecutionsMaxHistory: 10,
    jobHistoryColumnsPerLine: 10,
    minPipelineNumber: 10,
    pipelineWorkflowFetchSleepInMs: 200,
}
