import { ReactElement, useContext, useMemo } from 'react'
import { JobData } from '../../domain-models/models'
import { ConfigContext } from '../../contexts/DashboardContext'
import './JobCardFooterComponent.scss'
import { jobExecutionProps } from './jobExecutionProps'

type Props = {
    executions: JobData[]
    onHighlightedExecutionIndexChanged: (index: number) => void
    highlightedExecutionIndex: number
}

export const JobCardFooterComponent = (props: Props): ReactElement => {
    const configuration = useContext(ConfigContext)!

    const executions = useMemo(() => [...props.executions].reverse(), [props.executions])

    const gap = '3px'
    return (
        <div className="card-footer p-1 pb-2 px-3 card-details">
            <strong className="text-body-secondary">
                <div>History</div>
            </strong>
            {executions.map((execution, index) => {
                const classes = jobExecutionProps(execution)
                return (
                    <div
                        key={`job-history-${execution.id}-${index}-${execution.started_at}`}
                        onPointerDown={() => props.onHighlightedExecutionIndexChanged(executions.length - index - 1)}
                        className="progress border"
                        role="progressbar"
                        aria-label="Job status"
                        style={{
                            cursor: 'pointer',
                            width: `calc((100% / ${configuration.jobHistoryColumnsPerLine}) - ${gap})`,
                            height: '10px',
                            display: 'inline-flex',
                            marginRight: gap,
                            borderRadius: '3px',
                            boxShadow:
                                executions.length - index - 1 !== props.highlightedExecutionIndex
                                    ? 'unset'
                                    : `0 0 3px 2px var(--bs-${classes.color})`,
                        }}
                    >
                        <div
                            className={`progress-bar w-100 bg-${classes.color} ${classes.animated ? 'progress-bar-striped progress-bar-animated' : ''}`}
                        ></div>
                    </div>
                )
            })}
        </div>
    )
}
