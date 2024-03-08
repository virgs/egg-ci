import { JobData } from '../dashboard/DashboardRepository'
import { JobCardBodyComponent } from './JobCardBodyComponent'
import { JobCardFooterComponent } from './JobCardFooterComponent'
import { JobCardHeaderComponent } from './JobCardHeaderComponent'
import './JobCardComponent.scss'
import { useState } from 'react'

export type Props = {
    job: JobData
    jobOrder: number
    projectUrl: string
}

export const JobCardComponent = (props: Props): JSX.Element => {
    const [highlightedExecutionIndex, setHighlightedExecutionIndex] = useState<number>(0) //Zero is the index of the most recent one

    return (
        <div className="col">
            <div className="card h-100">
                <JobCardHeaderComponent projectUrl={props.projectUrl} jobOrder={props.jobOrder} job={props.job.executions[highlightedExecutionIndex]} />
                <JobCardBodyComponent job={props.job.executions[highlightedExecutionIndex]} />
                <JobCardFooterComponent executions={props.job.executions} highligthedExecutionIndex={highlightedExecutionIndex}
                    onHighligthedExecutionIndexChanged={index => setHighlightedExecutionIndex(index)} />
            </div >
        </div >
    )
}
