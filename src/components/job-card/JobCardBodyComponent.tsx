import { ReactElement } from 'react'
import {  faCodePullRequest } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { formatDuration } from '../../time/Time'
import './JobCardBodyComponent.scss'
import { JobData } from '../../domain-models/models'

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
    const detailsClass = (props.listView ? 'col-4' : 'col-12') + ' card-details text-body-secondary'

    return (
        <div className={`card-body row justify-content-between p-2 px-3${props.listView ? ' card-body--list' : ''}`}>
            <p className="col-12 card-text">
                <a
                    href={props.job.pipeline.vcs?.origin_repository_url
                        .concat('/commit/')
                        .concat(props.job.pipeline.vcs?.revision)}
                >
                    <FontAwesomeIcon className="me-2" icon={faCodePullRequest} />
                </a>
                {getCommitMessage()}
            </p>
            <div className="w-100"></div>
            <div className={`${detailsClass}${props.listView ? ' text-start' : ''}`}>
                <strong>Duration:</strong> {props.job.stopped_at ? latestExecutionDurationInMinutes : '-'}
            </div>
            <div className={`${detailsClass}${props.listView ? ' text-center' : ''}`}>
                <strong>Triggered by:</strong>
                <img
                    className="img-fluid mx-2 job-avatar"
                    alt="Pipeline author"
                    src={props.job.pipeline.trigger.actor.avatar_url}
                ></img>
                {props.job.pipeline.trigger.actor.login}
            </div>
            <div className={`${detailsClass}${props.listView ? ' text-end' : ''}`}>
                <span>
                    <strong>On: </strong>
                    {new Date(props.job.started_at!).toLocaleString()}
                </span>
            </div>
        </div>
    )
}
