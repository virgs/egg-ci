import { CSSProperties, ReactElement, useState } from 'react'
import { JobContextData } from '../../domain-models/models'
import { JobCardBodyComponent } from './JobCardBodyComponent'
import './JobCardComponent.scss'
import { JobCardFooterComponent } from './JobCardFooterComponent'
import { JobCardHeaderComponent } from './JobCardHeaderComponent'
import { jobExecutionProps } from './jobExecutionProps'
import { useWorkflowView } from '../../contexts/WorkflowViewContext'

export type Props = {
    job: JobContextData
    jobOrder: number
    projectUrl: string
    onHideJob: (jobName: string) => void
}

export const JobCardComponent = (props: Props): ReactElement => {
    const [highlightedExecutionIndex, setHighlightedExecutionIndex] = useState<number>(0)
    const { workflowView } = useWorkflowView()
    const safeIndex = Math.min(highlightedExecutionIndex, props.job.history.length - 1)
    const execution = props.job.history[safeIndex]

    const color = jobExecutionProps(execution).color
    const isCompact = workflowView === 'compact'
    const isList = workflowView === 'list'

    return (
        <div className="col">
            <div
                className={`card h-100 border-${color}${isList ? ' card--list' : ''}${isCompact ? ' card--compact' : ''}`}
                style={{ '--status-color': `var(--bs-${color})` } as CSSProperties}
            >
                <JobCardHeaderComponent
                    projectUrl={props.projectUrl}
                    jobOrder={props.jobOrder}
                    job={execution}
                    previousExecution={props.job.history[safeIndex + 1]}
                    onHideJob={props.onHideJob}
                />
                {!isCompact && <JobCardBodyComponent job={execution} listView={isList} />}
                {!isCompact && (
                    <JobCardFooterComponent
                        executions={props.job.history}
                        highlightedExecutionIndex={safeIndex}
                        onHighlightedExecutionIndexChanged={(index) => setHighlightedExecutionIndex(index)}
                        listView={isList}
                    />
                )}
            </div>
        </div>
    )
}
