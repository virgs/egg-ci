import { faCodePullRequest } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { JobData } from '../dashboard/DashboardRepository';
import { formatDuration } from '../time/Time';
import "./JobCardBodyComponent.scss"

type Props = {
    job: JobData
    index: number
    projectUrl: string
}
export const JobCardBodyComponent = (props: Props): JSX.Element => {
    const latestExecution = props.job.executions[0]
    const latestExecutionDurationInMinutes = formatDuration(
        new Date(latestExecution.stopped_at!).getTime() - new Date(latestExecution.started_at!).getTime()
    )

    const getCommitMessage = () => {
        const message = latestExecution.pipeline.vcs?.commit?.body ?? latestExecution.pipeline.vcs?.commit?.subject;
        if (message !== undefined && message.length > 0) {
            return message
        }
        return '** No information available **'
    }

    return <div className="card-body p-2 px-3">
        <p className="card-text">
            <a href={latestExecution.pipeline.vcs?.origin_repository_url
                .concat('/commit/')
                .concat(latestExecution.pipeline.vcs?.revision)}>
                <FontAwesomeIcon className="me-2" icon={faCodePullRequest} />
            </a>
            {getCommitMessage()}
        </p>
        <div className="card-details text-body-secondary">
            <strong>Duration:</strong> {latestExecution.stopped_at ? latestExecutionDurationInMinutes : '-'}
        </div>
        <div className="card-details text-body-secondary">
            <strong>Triggered by:</strong>
            <img
                className="img-fluid mx-2"
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
    </div>;
}
