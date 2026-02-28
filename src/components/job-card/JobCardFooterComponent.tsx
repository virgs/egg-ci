import { CSSProperties, ReactElement, useMemo } from 'react'
import { JobData } from '../../domain-models/models'
import { useWorkflowsPage } from '../../pages/WorkflowsPageContext'
import './JobCardFooterComponent.scss'
import { jobExecutionProps } from './jobExecutionProps'

const GRID_MAX_BARS = 5
const LIST_MAX_BARS = 10

type Props = {
    executions: JobData[]
    onHighlightedExecutionIndexChanged: (index: number) => void
    highlightedExecutionIndex: number
    listView?: boolean
}

export const JobCardFooterComponent = (props: Props): ReactElement => {
    const { workflowView } = useWorkflowsPage()
    const maxBars = workflowView === 'list' ? LIST_MAX_BARS : GRID_MAX_BARS

    const executions = useMemo(
        () => [...props.executions].reverse().slice(0, maxBars),
        [props.executions, maxBars]
    )

    return (
        <div className="card-footer p-1 pb-2 px-3">
            <strong className="text-body-secondary">
                <div className="mb-1">History</div>
            </strong>
            {executions.map((execution, index) => {
                const classes = jobExecutionProps(execution)
                const isHighlighted = executions.length - index - 1 === props.highlightedExecutionIndex
                return (
                    <div
                        key={`job-history-${execution.id}-${index}-${execution.started_at}`}
                        onPointerDown={() => props.onHighlightedExecutionIndexChanged(executions.length - index - 1)}
                        className={`progress border job-history-bar${props.listView ? ' job-history-bar--compact' : ''}${isHighlighted ? ' job-history-bar--highlighted' : ''}`}
                        role="progressbar"
                        aria-label="Job status"
                        style={
                            {
                                '--status-color': `var(--bs-${classes.color})`,
                                '--cols': maxBars,
                            } as CSSProperties
                        }
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
