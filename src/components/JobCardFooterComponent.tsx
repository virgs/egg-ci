import { Popover } from "bootstrap";
import { useEffect, useState } from "react";
import { JobData } from "../dashboard/DashboardRepository";
import { WorkflowJob } from "../gateway/models/ListWorkflowJobsResponse";
import "./JobCardFooterComponent.scss";

type Props = {
    job: JobData
    index: number
    projectUrl: string
}

const getClassesFromExecution = (job: WorkflowJob): string => {
    switch (job.status) {
        case 'success':
            return 'bg-success'
        case 'running':
            return 'bg-warning progress-bar-striped progress-bar-animated'

        case 'on_hold':
        case 'blocked':
        case 'queued':
        case 'retried':
            return 'bg-info progress-bar-striped progress-bar-animated'

        case 'terminated-unknown':
        case 'canceled':
        case 'failed':
        case 'not_running':
        case 'infrastructure_fail':
        case 'timedout':
            return 'bg-danger'

        case 'not_run':
        case 'unauthorized':
            return 'bg-light'
    }
}

const historySize = 5

export const JobCardFooterComponent = (props: Props): JSX.Element => {
    const [executions] = useState<WorkflowJob[]>(JSON.parse(JSON.stringify(props.job.executions)).reverse())

    useEffect(() => {
        Array.from(document.querySelectorAll('[data-bs-toggle="popover"]')).map(
            (popoverTriggerEl) =>
                new Popover(popoverTriggerEl, {
                    trigger: 'focus',
                })
        )
    }, [])

    const gap = '3px'
    return <div className="card-footer p-1 pb-2 px-3 card-details">
        <strong className="text-body-secondary">
            <div>History</div>
        </strong>
        {executions.map((execution) => {
            const color = getClassesFromExecution(execution)
            return (
                <div
                    key={`job-history-${execution.id}`}
                    data-virgs={new Date(execution.started_at!).toDateString()}
                    className="progress"
                    role="progressbar"
                    aria-label="Job status"
                    style={{
                        cursor: 'pointer',
                        width: `calc((100% / ${historySize}) - ${gap})`,
                        height: '8px',
                        display: 'inline-flex',
                        marginRight: gap,
                        borderRadius: '3px',
                    }}
                >
                    <div
                        tabIndex={0}
                        className={`progress-bar w-100 ${color}`}
                        data-bs-toggle="popover"
                        data-bs-title={execution.job_number}
                        data-bs-content={`Status: ${execution.status}; Date ${new Date(execution.started_at!).toDateString()} ${execution.name}`}
                    ></div>
                </div>
            )
        })}
    </div>;
}
