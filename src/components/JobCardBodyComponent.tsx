import { faCodePullRequest } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ExecutionData } from '../dashboard/DashboardRepository'
import { formatDuration } from '../time/Time'
import './JobCardBodyComponent.scss'

type Props = {
    job: ExecutionData
}
export const JobCardBodyComponent = (props: Props): JSX.Element => {
    const latestExecutionDurationInMinutes = formatDuration(
        new Date(props.job.stopped_at!).getTime() - new Date(props.job.started_at!).getTime()
    )

    const getCommitMessage = () => {
        const message = props.job.pipeline.vcs?.commit?.body ?? props.job.pipeline.vcs?.commit?.subject
        if (message !== undefined && message.length > 0) {
            return message
        }
        return '** No information available **'
    }

    return (
        <div className="card-body p-2 px-3">
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
                    className="img-fluid mx-2"
                    style={{ borderRadius: '100%', width: '16px' }}
                    alt="Pipeline author"
                    src={props.job.pipeline.trigger.actor.avatar_url}
                ></img>
                {props.job.pipeline.trigger.actor.login}
            </div>
            <div className="card-details text-body-secondary">
                <strong>On: </strong>
                {new Date(props.job.started_at!).toDateString()}
            </div>
        </div>
    )
}
