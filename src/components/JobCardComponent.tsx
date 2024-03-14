import { useState } from 'react'
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

export const JobCardComponent = (props: Props): JSX.Element => {
    const [highlightedExecutionIndex, setHighlightedExecutionIndex] = useState<number>(0) // Zero is the index of the most recent one

    return (
        <div className="col">
            <div
                className={`card h-100 ${props.job.history[highlightedExecutionIndex].status === 'success' ? '' : `border-${jobExecutionProps(props.job.history[highlightedExecutionIndex]).color}`}`}
            >
                <JobCardHeaderComponent
                    projectUrl={props.projectUrl}
                    jobOrder={props.jobOrder}
                    job={props.job.history[highlightedExecutionIndex]}
                />
                <JobCardBodyComponent job={props.job.history[highlightedExecutionIndex]} />
                <JobCardFooterComponent
                    executions={props.job.history}
                    highligthedExecutionIndex={highlightedExecutionIndex}
                    onHighligthedExecutionIndexChanged={(index) => setHighlightedExecutionIndex(index)}
                />
            </div>
        </div>
    )
}
