import { faBars, faEyeSlash, faInfo, faPlay, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as bootstrap from 'bootstrap'
import { useEffect } from 'react'
import { ExecutionData } from '../dashboard/DashboardRepository'
import { WorkflowJob } from '../gateway/models/ListWorkflowJobsResponse'
import { getClassesFromJobExecution } from './ClassesFromJobExecution'
import './JobCardHeaderComponent.scss'

type Props = {
    job: ExecutionData
    jobOrder: number
    projectUrl: string
}

const getStatusDisplay = (status: string): string => {
    return status
        .replace('_', ' ')
        .replace('-', ' ');
}
const getBadge = (job: WorkflowJob): JSX.Element => {
    const classes = getClassesFromJobExecution(job)
    return <FontAwesomeIcon style={{ color: `var(--bs-${classes.color})` }} icon={classes.actionIcon} />
}

export const JobCardHeaderComponent = (props: Props): JSX.Element => {
    const jobUrl = `${props.projectUrl}/${props.job.pipeline.number}/workflows/${props.job.workflow.id}/jobs/${props.job.job_number}`

    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        Array.from(tooltipTriggerList)
            .map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl, {
                delay: {
                    show: 750,
                    hide: 100
                }
            }))
    }, [])

    const renderTitle = () => {
        const content = <>{props.jobOrder + 1}. {props.job.name}</>
        if (props.job.type === 'build') {
            return <a href={jobUrl}>{content}</a>
        }
        return content
    }
    const renderInfoButton = () => {
        if (props.job.type === 'build') {
            return <div>
                {/* <button className="btn btn-secondary dropdown-toggle" type="button"> */}
                <FontAwesomeIcon data-bs-toggle="dropdown" data-bs-auto-close="true" aria-expanded="false"
                    style={{ float: 'right', cursor: 'pointer' }} icon={faBars} />
                {/* </button> */}
                <ul className="dropdown-menu">
                    <li><a className="dropdown-item disabled" href="#">
                        Details</a></li>
                    <li><a className="dropdown-item disabled" href="#">
                        Hide
                    </a></li>
                </ul>
            </div>
            // return 
        }
        return <></>
    }
    const renderActionButton = () => {
        if (props.job.type === 'build') {
            return <button type="button" data-bs-toggle="tooltip" data-bs-title="Rerun job"
                className="btn btn-outline-primary py-0 px-2" style={{ fontSize: '8px' }}>
                <FontAwesomeIcon icon={faPlay}></FontAwesomeIcon>
            </button>
        }
        return <button type="button" data-bs-toggle="tooltip" data-bs-title="Approve job"
            disabled={props.job.status === 'success'}
            className="btn btn-outline-primary py-0 px-2" style={{ fontSize: '8px' }}>
            <FontAwesomeIcon icon={faThumbsUp}></FontAwesomeIcon>
        </button>
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
                    #{props.job.workflow.pipeline_number}
                </div>
                <div className='col-4 card-header-details' style={{ textAlign: 'center' }}>
                    {renderActionButton()}
                </div>
                <div className='col card-header-details'>
                    <div style={{ float: 'right', display: 'inline-flex', alignItems: 'center' }}>
                        <small className='me-1' style={{ textTransform: 'capitalize' }}>
                            {getStatusDisplay(props.job.status)}
                        </small>
                        <span>
                            {getBadge(props.job)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
