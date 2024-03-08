import { faCheck, faCircleInfo, faPause, faPlay, faRefresh, faRotate, faThumbsUp, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { JobData } from '../dashboard/DashboardRepository'
import { WorkflowJob } from '../gateway/models/ListWorkflowJobsResponse'
import './JobCardHeaderComponent.scss'
import { useEffect } from 'react'
import * as bootstrap from 'bootstrap'

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
        const content = <>{props.index + 1}. {latestExecution.name}</>
        if (latestExecution.type === 'build') {
            return <a href={jobUrl}>{content}</a>
        }
        return content
    }
    const renderInfoButton = () => {
        if (latestExecution.type === 'build') {
            return <FontAwesomeIcon data-bs-toggle="tooltip" data-bs-title="Get more info"
                style={{ float: 'right', cursor: 'pointer' }} icon={faCircleInfo} />
        }
        return <></>
    }
    const renderActionButton = () => {
        if (latestExecution.type === 'build') {
            return <button type="button" data-bs-toggle="tooltip" data-bs-title="Rerun job"
                className="btn btn-outline-primary py-0 px-2" style={{ fontSize: '8px' }}>
                <FontAwesomeIcon icon={faRefresh}></FontAwesomeIcon>
            </button>
        }
        return <button type="button" data-bs-toggle="tooltip" data-bs-title="Approve job"
            disabled={latestExecution.status === 'success'}
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
                    #{latestExecution.workflow.pipeline_number}
                </div>
                <div className='col-4 card-header-details' style={{ textAlign: 'center' }}>
                    {renderActionButton()}
                </div>
                <div className='col card-header-details'>
                    <div style={{ float: 'right', display: 'inline-flex', alignItems: 'center' }}>
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
