import { ReactElement, useEffect, useRef } from 'react'
import { Tooltip } from 'bootstrap'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { JobData } from '../domain-models/models'
import { WorkflowJob } from '../gateway/models/ListWorkflowJobsResponse'
import { JobActionButton } from './JobActionButton'
import './JobCardHeaderComponent.scss'
import { jobExecutionProps } from './jobExecutionProps'

type Props = {
    job: JobData
    previousExecution?: JobData
    jobOrder: number
    projectUrl: string
    onHideJob: (jobName: string) => void
}

const getStatusDisplay = (status: string): string => {
    return status.replace('_', ' ').replace('-', ' ')
}
const getBadge = (job: WorkflowJob): ReactElement => {
    const classes = jobExecutionProps(job)
    return (
        <FontAwesomeIcon
            className={job.status === 'running' ? 'fa-spin' : ''}
            style={{ color: `var(--bs-${classes.color})` }}
            icon={classes.actionIcon}
        />
    )
}

export const JobCardHeaderComponent = (props: Props): ReactElement => {
    const titleRef = useRef<HTMLHeadingElement>(null)
    const jobUrl = `${props.projectUrl}/${props.job.workflow.pipeline_number}/workflows/${props.job.workflow.pipeline_id}/jobs/${props.job.job_number}`
    const vcs = props.job.pipeline.vcs
    const browseUrl = vcs ? `${vcs.origin_repository_url}/tree/${vcs.revision}` : undefined
    const prevVcs = props.previousExecution?.pipeline.vcs
    const compareUrl =
        vcs && prevVcs
            ? `${vcs.origin_repository_url}/compare/${prevVcs.revision}...${vcs.revision}`
            : undefined

    useEffect(() => {
        if (titleRef.current) {
            new Tooltip(titleRef.current, { delay: { show: 500, hide: 100 } })
        }
    }, [])

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
        return (
            <div>
                <FontAwesomeIcon
                    data-bs-toggle="dropdown"
                    data-bs-auto-close="true"
                    aria-expanded="false"
                    className="job-menu-trigger"
                    icon={faBars}
                />
                <ul className="dropdown-menu">
                    <li>
                        <button className="dropdown-item" type="button" onClick={() => props.onHideJob(props.job.name)}>
                            Hide job
                        </button>
                    </li>
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li>
                        <a className="dropdown-item disabled" href="#">
                            Details
                        </a>
                    </li>
                    <li>
                        <a
                            className={`dropdown-item${browseUrl ? '' : ' disabled'}`}
                            href={browseUrl ?? '#'}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Browse repo at this point
                        </a>
                    </li>
                    <li>
                        <a
                            className={`dropdown-item${compareUrl ? '' : ' disabled'}`}
                            href={compareUrl ?? '#'}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Compare against previous execution
                        </a>
                    </li>
                </ul>
            </div>
        )
    }

    return (
        <div className="card-header p-1 pt-2 px-3">
            <div className="row h-100 align-items-center g-0">
                <div className="col-10">
                    <h6
                        ref={titleRef}
                        className="card-title m-0"
                        data-bs-toggle="tooltip"
                        data-bs-title={props.job.name}
                    >
                        {renderTitle()}
                    </h6>
                </div>
                <div className="col-2">{renderInfoButton()}</div>
                <div className="w-100 mb-2"></div>
                <div className="col card-header-details">
                    <a href=""></a>#{props.job.workflow.pipeline_number}
                </div>
                <div className="col card-header-details">
                    <div className="job-status-inline">
                        <small className="me-1 text-capitalize">
                            {getStatusDisplay(props.job.status)}
                        </small>
                        <span>{getBadge(props.job)}</span>
                    </div>
                </div>
                <div className="col-4 card-header-details text-end">
                    <JobActionButton job={props.job}></JobActionButton>
                </div>
            </div>
        </div>
    )
}
