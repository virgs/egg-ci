import { CSSProperties, ReactElement, useState } from 'react'
import { JobContextData } from '../../domain-models/models'
import { JobCardBodyComponent } from './JobCardBodyComponent'
import './JobCardComponent.scss'
import { JobCardFooterComponent } from './JobCardFooterComponent'
import { JobCardHeaderComponent } from './JobCardHeaderComponent'
import { jobExecutionProps } from './jobExecutionProps'

export type Props = {
    job: JobContextData
    jobOrder: number
    projectUrl: string
    onHideJob: (jobName: string) => void
    listView?: boolean
}

export const JobCardComponent = (props: Props): ReactElement => {
    const [highlightedExecutionIndex, setHighlightedExecutionIndex] = useState<number>(0) // Zero is the index of the most recent one
    const safeIndex = Math.min(highlightedExecutionIndex, props.job.history.length - 1)
    const execution = props.job.history[safeIndex]

    const color = jobExecutionProps(execution).color
    return (
        <div className="col">
            <div
                className={`card h-100 border-${color}${props.listView ? ' card--list' : ''}`}
                style={{ '--status-color': `var(--bs-${color})` } as CSSProperties}
            >
                <JobCardHeaderComponent
                    projectUrl={props.projectUrl}
                    jobOrder={props.jobOrder}
                    job={execution}
                    previousExecution={props.job.history[safeIndex + 1]}
                    onHideJob={props.onHideJob}
                />
                <JobCardBodyComponent job={execution} listView={props.listView} />
                <JobCardFooterComponent
                    executions={props.job.history}
                    highlightedExecutionIndex={safeIndex}
                    onHighlightedExecutionIndexChanged={(index) => setHighlightedExecutionIndex(index)}
                    listView={props.listView}
                />
            </div>
        </div>
    )
}
