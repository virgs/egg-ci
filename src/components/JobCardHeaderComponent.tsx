import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { JobData } from '../domain-models/models'
import { WorkflowJob } from '../gateway/models/ListWorkflowJobsResponse'
import { JobActionButton } from './JobActionButton'
import './JobCardHeaderComponent.scss'
import { jobExecutionProps } from './jobExecutionProps'

type Props = {
    job: JobData
    jobOrder: number
    projectUrl: string
}

const getStatusDisplay = (status: string): string => {
    return status.replace('_', ' ').replace('-', ' ')
}
const getBadge = (job: WorkflowJob): JSX.Element => {
    const classes = jobExecutionProps(job)
    return (
        <FontAwesomeIcon
            className={job.status === 'running' ? 'fa-spin' : ''}
            style={{ color: `var(--bs-${classes.color})` }}
            icon={classes.actionIcon}
        />
    )
}

export const JobCardHeaderComponent = (props: Props): JSX.Element => {
    const jobUrl = `${props.projectUrl}/${props.job.workflow.pipeline_number}/workflows/${props.job.workflow.pipeline_id}/jobs/${props.job.job_number}`

    const renderTitle = () => {
        const content = (
            <>
                {props.jobOrder + 1}. {props.job.name}
            </>
        )
        if (props.job.type === 'build') {
            return <a href={jobUrl}>{content}</a>
        }
        return content
    }

    const renderInfoButton = () => {
        if (props.job.type === 'build') {
            return (
                <div>
                    <FontAwesomeIcon
                        data-bs-toggle="dropdown"
                        data-bs-auto-close="true"
                        aria-expanded="false"
                        style={{ float: 'right', cursor: 'pointer' }}
                        icon={faBars}
                    />
                    <ul className="dropdown-menu">
                        <li>
                            <a className="dropdown-item disabled" href="#">
                                Details
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item disabled" href="#">
                                Hide
                            </a>
                        </li>
                    </ul>
                </div>
            )
        }
        return <></>
    }

    return (
        <div className="card-header p-1 pt-2 px-3">
            <div className="row h-100 align-items-center g-0">
                <div className="col-10">
                    <h6 className="card-title m-0">{renderTitle()}</h6>
                </div>
                <div className="col-2">{renderInfoButton()}</div>
                <div className="w-100 mb-2"></div>
                <div className="col card-header-details">
                    <a href=""></a>#{props.job.workflow.pipeline_number}
                </div>
                <div className="col-4 card-header-details" style={{ textAlign: 'center' }}>
                    <JobActionButton job={props.job}></JobActionButton>
                </div>
                <div className="col card-header-details">
                    <div style={{ float: 'right', display: 'inline-flex', alignItems: 'center' }}>
                        <small className="me-1" style={{ textTransform: 'capitalize' }}>
                            {getStatusDisplay(props.job.status)}
                        </small>
                        <span>{getBadge(props.job)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
