import { ReactElement, useState } from 'react'
import { Config } from '../config'

type Props = {
    config: Config
    onChange: (config: Config) => void
    onUnexcludeAll?: () => void
    excludedProjectsCount?: number
}

export const ConfigurationComponent = (props: Props): ReactElement => {
    const [minPipelineNumber, setMinPipelineNumber] = useState<number>(props.config.minPipelineNumber)
    const [pipelineWorkflowFetchSleepInMs, setPipelineWorkflowFetchSleepInMs] = useState<number>(
        props.config.pipelineWorkflowFetchSleepInMs
    )
    const [jobExecutionsMaxHistory, setJobExecutionsMaxHistory] = useState<number>(props.config.jobExecutionsMaxHistory)

    const notify = (overrides: Partial<Config>) => {
        props.onChange({
            jobExecutionsMaxHistory,
            jobHistoryColumnsPerLine: props.config.jobHistoryColumnsPerLine,
            autoSyncInterval: props.config.autoSyncInterval,
            minPipelineNumber,
            pipelineWorkflowFetchSleepInMs,
            ...overrides,
        })
    }

    return (
        <div className="row">
            <div className="col-12 col-lg-6 col-xl-4 d-flex pb-2">
                <input
                    type="range"
                    className="form-range w-50"
                    min="20"
                    max="250"
                    step="10"
                    id="minPipelineNumber"
                    value={minPipelineNumber}
                    onChange={(event) => {
                        const value = parseInt(event.target.value)
                        setMinPipelineNumber(value)
                        notify({ minPipelineNumber: value })
                    }}
                />
                <label className="form-label w-100 ps-2" htmlFor="minPipelineNumber">
                    Minimum pipelines to retrieve: {minPipelineNumber}
                </label>
            </div>
            <div className="col-12 col-lg-6 col-xl-4 d-flex pb-2">
                <input
                    type="range"
                    className="form-range w-50"
                    min="100"
                    max="500"
                    step="10"
                    id="pipelineWorkflowFetchSleepInMs"
                    value={pipelineWorkflowFetchSleepInMs}
                    onChange={(event) => {
                        const value = parseInt(event.target.value)
                        setPipelineWorkflowFetchSleepInMs(value)
                        notify({ pipelineWorkflowFetchSleepInMs: value })
                    }}
                />
                <label className="form-label w-100 ps-2" htmlFor="pipelineWorkflowFetchSleepInMs">
                    Pipeline fetch interval: {pipelineWorkflowFetchSleepInMs}ms
                </label>
            </div>
            <div className="col-12 col-lg-6 col-xl-4 d-flex pb-2">
                <input
                    type="range"
                    className="form-range w-50"
                    min="5"
                    max="15"
                    step="5"
                    id="jobExecutionsMaxHistory"
                    value={jobExecutionsMaxHistory}
                    onChange={(event) => {
                        const value = parseInt(event.target.value)
                        setJobExecutionsMaxHistory(value)
                        notify({ jobExecutionsMaxHistory: value })
                    }}
                />
                <label className="form-label w-100 ps-2" htmlFor="jobExecutionsMaxHistory">
                    Jobs Max History: {jobExecutionsMaxHistory}
                </label>
            </div>
            {props.onUnexcludeAll && (
                <div className="col-12 pb-2">
                    <button className="btn btn-sm btn-outline-secondary" type="button" onClick={props.onUnexcludeAll}>
                        Restore excluded projects
                        <span className="badge bg-secondary ms-2">{props.excludedProjectsCount ?? 0}</span>
                    </button>
                </div>
            )}
        </div>
    )
}
