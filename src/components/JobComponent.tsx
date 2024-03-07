import { faCheck, faCircleInfo, faCodePullRequest, faPause, faRotate, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { JobData } from '../dashboard/DashboardRepository'
import { WorkflowJob } from '../gateway/models/ListWorkflowJobsResponse'
import { formatDuration } from '../time/Time'
import './JobComponent.scss'
import { JobExecutionHistoryComponent } from './JobExecutionHistoryComponent'

type Props = {
    job: JobData
    index: number
    projectUrl: string
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

export const JobComponent = (props: Props): JSX.Element => {
    const latestExecution = props.job.executions[0]
    const latestExecutionDurationInMinutes = formatDuration(
        new Date(latestExecution.stopped_at!).getTime() - new Date(latestExecution.started_at!).getTime()
    )

    const jobUrl = `${props.projectUrl}/${latestExecution.pipeline.number}/workflows/${latestExecution.workflow.id}/jobs/${latestExecution.job_number}`
    // const jobUrl = `a`

    return (
        <div className="col">
            <div className={`card h-100`}>
                <div className="card-header p-1 pt-2 px-3">
                    <div className='row h-100 justify-content-between align-content-center g-0'>
                        <div className='col-10'>
                            <h6 className="card-title">
                                <a href={jobUrl}>
                                    {props.index + 1}. {props.job.name}
                                </a>
                            </h6>
                        </div>
                        <div className='col-auto'>
                            <FontAwesomeIcon icon={faCircleInfo} />
                        </div>
                        <div className='w-100'></div>
                        <div className='col-auto card-header-details'>
                            #{latestExecution.workflow.pipeline_number}
                        </div>
                        <div className='col-auto card-header-details'>
                            <small className='me-2' style={{ textTransform: 'capitalize' }}>
                                {latestExecution.status}
                            </small>
                            {getBadge(latestExecution)}
                        </div>
                    </div>
                </div>
                <div className="card-body p-2 px-3">
                    <p className="card-text">
                        <a
                            href={latestExecution.pipeline.vcs?.origin_repository_url
                                .concat('/commit/')
                                .concat(latestExecution.pipeline.vcs?.revision)}
                        >
                            <FontAwesomeIcon className="me-2" icon={faCodePullRequest} />
                        </a>
                        {latestExecution.pipeline.vcs?.commit?.body ?? 'No information available'}
                    </p>
                    {/* TODO: move everything below to the bottom of the body */}
                    <div className="card-details text-body-secondary">Type: {latestExecution.type}</div>
                    <div className="card-details text-body-secondary">
                        <strong>Duration:</strong> {latestExecution.stopped_at ? latestExecutionDurationInMinutes : '-'}
                    </div>
                    <div className="card-details text-body-secondary">
                        <strong>Triggered by:</strong>
                        <img
                            className="img-fluid mx-1"
                            style={{ borderRadius: '100%', width: '16px' }}
                            alt="Pipeline author"
                            src={latestExecution.pipeline.trigger.actor.avatar_url}
                        ></img>
                        {latestExecution.pipeline.trigger.actor.login}
                    </div>
                    <div className="card-details text-body-secondary">
                        <strong>On: </strong>
                        {new Date(latestExecution.started_at!).toDateString()}
                    </div>
                </div>
                <div className="card-footer card-details text-body-secondary">
                    <strong>
                        <div>History</div>
                    </strong>
                    <JobExecutionHistoryComponent job={props.job} historySize={5}></JobExecutionHistoryComponent>
                </div>
            </div>
        </div>
    )
}
