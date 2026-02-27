import { ReactElement } from 'react'
import {  faCodePullRequest } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatDuration } from '../time/Time'
import './JobCardBodyComponent.scss'
import { JobData } from '../domain-models/models'

type Props = {
    job: JobData
    listView?: boolean
}
export const JobCardBodyComponent = (props: Props): ReactElement => {
    const latestExecutionDurationInMinutes = formatDuration(
        new Date(props.job.stopped_at!).getTime() - new Date(props.job.started_at!).getTime()
    )

    const getCommitMessage = () => {
        const commit = props.job.pipeline.vcs?.commit
        if (commit) {
            if (commit.subject.length > 0) {
                return commit.subject
            }
            if (commit.body.length > 0) {
                return commit.body
            }
        }
        return '** No information available **'
    }

    return (
        <div className={`card-body p-2 px-3${props.listView ? ' card-body--list' : ''}`}>
            <p className="card-text">
                <a
                    href={props.job.pipeline.vcs?.origin_repository_url
                        .concat('/commit/')
                        .concat(props.job.pipeline.vcs?.revision)}
                >
                    <FontAwesomeIcon className="me-2" icon={faCodePullRequest} />
                </a>
                {getCommitMessage()}
            </p>
            <div className="card-details text-body-secondary">
                <strong>Duration:</strong> {props.job.stopped_at ? latestExecutionDurationInMinutes : '-'}
            </div>
            <div className="card-details text-body-secondary">
                <strong>Triggered by:</strong>
                <img
                    className="img-fluid mx-2 job-avatar"
                    alt="Pipeline author"
                    src={props.job.pipeline.trigger.actor.avatar_url}
                ></img>
                {props.job.pipeline.trigger.actor.login}
            </div>
            <div className="card-details text-body-secondary d-flex justify-content-between">
                <span>
                    <strong>On: </strong>
                    {new Date(props.job.started_at!).toLocaleString()}
                </span>
                {/*<FontAwesomeIcon style={{ fontSize: '15px', cursor: 'pointer' }} icon={faCircleChevronLeft} />*/}
            </div>
        </div>
    )
}
