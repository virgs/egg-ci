import { ReactElement, useEffect, useState } from 'react'
import { Config } from '../config'

type Props = {
    config: Config
    onChange: (config: Config) => void
}

export const ConfigurationComponent = (props: Props): ReactElement => {
    const [includeBuildJobsCheckBox, setIncludeBuildJobsCheckBox] = useState<boolean>(props.config.includeBuildJobs)
    const [minPipelineNumber, setMinPipelineNumber] = useState<number>(props.config.minPipelineNumber)
    const [pipelineWorkflowFetchSleepInMs, setPipelineWorkflowFetchSleepInMs] = useState<number>(
        props.config.pipelineWorkflowFetchSleepInMs
    )
    const [jobExecutionsMaxHistory, setJobExecutionsMaxHistory] = useState<number>(props.config.jobExecutionsMaxHistory)

    useEffect(() => {
        props.onChange({
            jobExecutionsMaxHistory: jobExecutionsMaxHistory,
            jobHistoryColumnsPerLine: props.config.jobHistoryColumnsPerLine,
            autoSyncInterval: props.config.autoSyncInterval,
            minPipelineNumber: minPipelineNumber,
            pipelineWorkflowFetchSleepInMs: pipelineWorkflowFetchSleepInMs,
            includeBuildJobs: includeBuildJobsCheckBox,
        })
    }, [includeBuildJobsCheckBox, minPipelineNumber, pipelineWorkflowFetchSleepInMs, jobExecutionsMaxHistory])

    return (
        <div className="row">
            <div className="col-12 pb-2 d-flex align-items-center justify-content-between" style={{}}>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id="includeBuildJobsCheckBox"
                        checked={includeBuildJobsCheckBox}
                        onChange={() => setIncludeBuildJobsCheckBox(!includeBuildJobsCheckBox)}
                    />
                    <label className="px-1 form-check-label" htmlFor="includeBuildJobsCheckBox">
                        Include build Jobs
                    </label>
                </div>
            </div>
            <div className="col-12 col-lg-6 col-xl-4 d-flex pb-2">
                <input
                    type="range"
                    className="form-range w-50"
                    min="20"
                    max="250"
                    step="10"
                    id="minPipelineNumber"
                    value={minPipelineNumber}
                    onChange={(event) => setMinPipelineNumber(parseInt(event.target.value))}
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
                    onChange={(event) => setPipelineWorkflowFetchSleepInMs(parseInt(event.target.value))}
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
                    onChange={(event) => setJobExecutionsMaxHistory(parseInt(event.target.value))}
                />
                <label className="form-label w-100 ps-2" htmlFor="jobExecutionsMaxHistory">
                    Jobs Max History: {jobExecutionsMaxHistory}
                </label>
            </div>
        </div>
    )
}
