import { JobData } from "../dashboard/DashboardRepository";
import { formatDuration } from "../time/Time";
import { JobExecutionHistoryComponent } from "./JobExecutionHistoryComponent";

type Props = {
    job: JobData;
    index: number
};

export const JobComponent = (props: Props): JSX.Element => {
    const latestExecution = props.job.executions[0];
    const lastExecutionDurationInMinutes = formatDuration(new Date(latestExecution.stopped_at!).getTime() - new Date(latestExecution.started_at!).getTime());
    return <div className="col">
        <div className={`card h-100`} style={{ maxWidth: '350px' }}>
            <div className="card-header" style={{ height: '100px' }}>
                <h4 className="card-title">{props.index + 1}. {props.job.name}
                </h4>
            </div>
            <div className="card-body">
                <div className="card-text">Duration: {(latestExecution.stopped_at && latestExecution.started_at) ? lastExecutionDurationInMinutes : '-'}</div>
                <p className="card-text"><small className="text-body-secondary">Triggered on: {latestExecution.started_at ? new Date(latestExecution.started_at!).toLocaleDateString() : '-'}</small></p>
            </div>
            <div className="card-footer text-start">
                <div className="card-text"><small className="text-body-secondary">History</small></div>
                <JobExecutionHistoryComponent job={props.job} historySize={5}></JobExecutionHistoryComponent>
            </div>
        </div>
    </div>;
};
