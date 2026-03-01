import { ReactElement } from 'react'
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { faBars, faCode, faCodeCompare, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { JobData } from '../../domain-models/models'
import { WorkflowJob } from '../../gateway/models/ListWorkflowJobsResponse'
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
            className={`${job.status === 'running' ? 'fa-spin ' : ''}text-${classes.color}`}
            icon={classes.actionIcon}
        />
    )
}

export const JobCardHeaderComponent = (props: Props): ReactElement => {
    const jobUrl = `${props.projectUrl}/${props.job.workflow.pipeline_number}/workflows/${props.job.workflow.pipeline_id}/jobs/${props.job.job_number}`
    const vcs = props.job.pipeline.vcs
    const browseUrl = vcs ? `${vcs.origin_repository_url}/tree/${vcs.revision}` : undefined
    const prevVcs = props.previousExecution?.pipeline.vcs
    const compareUrl =
        vcs && prevVcs
            ? `${vcs.origin_repository_url}/compare/${prevVcs.revision}...${vcs.revision}`
            : undefined

    const renderTitle = () => {
        const content = (
            <>
                {props.jobOrder + 1}. {props.job.name}
            </>
        )
        if (props.job.type === 'build') {
            return (
                <a className="text-decoration-none" href={jobUrl}>
                    {content}
                </a>
            )
        }
        return content
    }

    const renderInfoButton = () => (
        <Dropdown>
            <Dropdown.Toggle as="span" bsPrefix="job-menu">
                <FontAwesomeIcon className="job-menu-trigger" icon={faBars} />
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={() => props.onHideJob(props.job.name)}>
                    <FontAwesomeIcon className="me-2" icon={faEyeSlash} />
                    Hide job
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                    disabled={!browseUrl}
                    href={browseUrl ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                >
                    <FontAwesomeIcon className="me-2" icon={faCodeCompare} />
                    Browse repo at this point
                </Dropdown.Item>
                <Dropdown.Item
                    disabled={!compareUrl}
                    href={compareUrl ?? '#'}
                    target="_blank"
                    rel="noreferrer"
                >
                    <FontAwesomeIcon className="me-2" icon={faCode} />
                    Compare against previous execution
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )

    return (
        <div className="card-header p-1 pt-2 px-3">
            <div className="row h-100 align-items-center g-0">
                <div className="col-10">
                    <OverlayTrigger
                        placement="top"
                        delay={{ show: 500, hide: 100 }}
                        overlay={<Tooltip>{props.job.name}</Tooltip>}
                    >
                        <h6 className="card-title m-0">{renderTitle()}</h6>
                    </OverlayTrigger>
                </div>
                <div className="col-2">{renderInfoButton()}</div>
                <div className="w-100 mb-2"></div>
                <div className="col card-header-details">
                    <a href=""></a>#{props.job.workflow.pipeline_number}
                </div>
                <div className="col card-header-details card-details-job-status">
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
