import { faCheck, faCircleInfo, faPause, faPlay, faRotate, faThumbsUp, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { JobData } from '../dashboard/DashboardRepository'
import { WorkflowJob } from '../gateway/models/ListWorkflowJobsResponse'
import './JobCardHeaderComponent.scss'

type Props = {
    job: JobData
    index: number
    projectUrl: string
}

const getStatusDisplay = (status: string): string => {
    return status
        .replace('_', ' ')
        .replace('-', ' ');
}
const getBadge = (job: WorkflowJob): JSX.Element => {
    switch (job.status) {
        case 'success':
            return <FontAwesomeIcon style={{ color: 'var(--bs-success)' }} icon={faCheck} />
        case 'running':
        case 'retried':
            return <FontAwesomeIcon className="fa-spin" style={{ color: 'var(--bs-success)' }} icon={faRotate} />

        case 'on_hold':
        case 'blocked':
        case 'queued':
            return <FontAwesomeIcon style={{ color: 'var(--bs-info)' }} icon={faPause} />

        case 'terminated-unknown':
        case 'canceled':
        case 'failed':
        case 'not_running':
        case 'infrastructure_fail':
        case 'timedout':
        case 'not_run':
        case 'unauthorized':
            return <FontAwesomeIcon style={{ color: 'var(--bs-danger)' }} icon={faXmark} />
    }
}

export const JobCardHeaderComponent = (props: Props): JSX.Element => {
    const latestExecution = props.job.executions[0]
    const jobUrl = `${props.projectUrl}/${latestExecution.pipeline.number}/workflows/${latestExecution.workflow.id}/jobs/${latestExecution.job_number}`

    const renderTitle = () => {
        const content = <>{props.index + 1}. {latestExecution.name}</>
        if (latestExecution.type === 'build') {
            return <a href={jobUrl}>{content}</a>
        }
        return content
    }
    const renderInfoButton = () => {
        if (latestExecution.type === 'build') {
            return <FontAwesomeIcon style={{ float: 'right' }} icon={faCircleInfo} />
        }
        return <></>
    }
    const renderActionButton = () => {
        if (latestExecution.type === 'build') {
            return <FontAwesomeIcon icon={faPlay}></FontAwesomeIcon>
        }
        return <FontAwesomeIcon icon={faThumbsUp}></FontAwesomeIcon>
    }
    return (
        <div className="card-header p-1 pt-2 px-3">
            <div className='row h-100 align-items-center g-0'>
                <div className='col-10'>
                    <h6 className="card-title m-0">
                        {renderTitle()}
                    </h6>
                </div>
                <div className='col-2'>
                    {renderInfoButton()}
                </div>
                <div className='w-100 mb-2'></div>
                <div className='col card-header-details'>
                    #{latestExecution.workflow.pipeline_number}
                </div>
                <div className='col-4 card-header-details' style={{ textAlign: 'center' }}>
                    <button type="button" className="btn btn-outline-primary p-1 px-2" style={{ fontSize: '8px' }}>
                        {renderActionButton()}
                    </button>
                </div>
                <div className='col card-header-details'>
                    <div style={{ float: 'right' }}>
                        <small className='me-1' style={{ textTransform: 'capitalize' }}>
                            {getStatusDisplay(latestExecution.status)}
                        </small>
                        <span>
                            {getBadge(latestExecution)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
