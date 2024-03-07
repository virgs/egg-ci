import { JobData } from '../dashboard/DashboardRepository'
import { formatDuration } from '../time/Time'
import { JobCardHeaderComponent } from './JobCardHeaderComponent'
import { JobCardFooterComponent } from './JobCardFooterComponent'
import './JobComponent.scss'
import { JobCardBodyComponent } from './JobCardBodyComponent'

export type Props = {
    job: JobData
    index: number
    projectUrl: string
}


export const JobComponent = (props: Props): JSX.Element => {
    return (
        <div className="col">
            <div className={`card h-100`}>
                <JobCardHeaderComponent {...props} />
                <JobCardBodyComponent {...props} />
                <JobCardFooterComponent {...props} />
            </div >
        </div >
    )
}


