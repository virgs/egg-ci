import { ReactElement, useState } from 'react'
import { JobContextData } from '../domain-models/models'
import { JobCardBodyComponent } from './JobCardBodyComponent'
import './JobCardComponent.scss'
import { JobCardFooterComponent } from './JobCardFooterComponent'
import { JobCardHeaderComponent } from './JobCardHeaderComponent'
import { jobExecutionProps } from './jobExecutionProps'

export type Props = {
    job: JobContextData
    jobOrder: number
    projectUrl: string
}

export const JobCardComponent = (props: Props): ReactElement => {
    const [highlightedExecutionIndex, setHighlightedExecutionIndex] = useState<number>(0) // Zero is the index of the most recent one
    const safeIndex = Math.min(highlightedExecutionIndex, props.job.history.length - 1)
    const execution = props.job.history[safeIndex]

    return (
        <div className="col">
            <div
                className={`card h-100 ${execution.status === 'success' ? 'border-success' : `border-${jobExecutionProps(execution).color}`}`}
            >
                <JobCardHeaderComponent
                    projectUrl={props.projectUrl}
                    jobOrder={props.jobOrder}
                    job={execution}
                />
                <JobCardBodyComponent job={execution} />
                <JobCardFooterComponent
                    executions={props.job.history}
                    highligthedExecutionIndex={safeIndex}
                    onHighligthedExecutionIndexChanged={(index) => setHighlightedExecutionIndex(index)}
                />
            </div>
        </div>
    )
}
