import { JobData } from '../dashboard/DashboardRepository'
import { JobCardBodyComponent } from './JobCardBodyComponent'
import { JobCardFooterComponent } from './JobCardFooterComponent'
import { JobCardHeaderComponent } from './JobCardHeaderComponent'
import './JobCardComponent.scss'

export type Props = {
    job: JobData
    index: number
    projectUrl: string
}

export const JobCardComponent = (props: Props): JSX.Element => {
    return (
        <div className="col">
            <div className="card h-100">
                <JobCardHeaderComponent {...props} />
                <JobCardBodyComponent {...props} />
                <JobCardFooterComponent {...props} />
            </div >
        </div >
    )
}
