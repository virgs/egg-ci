import { useEffect } from "react";
import { JobData } from "../dashboard/DashboardRepository";
import { WorkflowJob } from "../gateway/models/ListWorkflowJobsResponse";
import { Popover } from 'bootstrap';

interface Props {
    job: JobData,
    historySize: number
}

export const JobExecutionHistoryComponent = (props: Props): JSX.Element[] => {
    const getClassesFromExecution = (job: WorkflowJob): string => {
        switch (job.status) {
            case "success":
                return 'bg-success'
            case "running":
                return 'bg-warning progress-bar-striped progress-bar-animated'

            case "on_hold":
            case "blocked":
            case "queued":
            case "retried":
                return 'bg-info progress-bar-striped'

            case "terminated-unknown":
            case "canceled":
            case "failed":
            case "not_running":
            case "infrastructure_fail":
            case "timedout":
                return 'bg-danger'

            case "not_run":
            case "unauthorized":
                return 'bg-light'

        }
    }

    useEffect(() => {
        Array.from(document.querySelectorAll('[data-bs-toggle="popover"]'))
            .map(popoverTriggerEl => new Popover(popoverTriggerEl, {
                trigger: 'focus'
            }))
    }, [])

    return props.job.executions
        .map((execution) => {
            const color = getClassesFromExecution(execution)
            return <div key={`job-history-${execution.id}`} className="progress" role="progressbar" aria-label="Basic example"
                style={{
                    cursor: 'pointer',
                    width: `calc((100% / ${props.historySize}) - 3px)`,
                    height: '7.5px',
                    display: 'inline-flex',
                    marginRight: '3px',
                    borderRadius: '3px'
                }}>
                <div tabIndex={0} className={`progress-bar w-100 ${color}`} data-bs-toggle="popover" data-bs-title={execution.job_number}
                    data-bs-content={`Status: ${execution.status}; Date ${new Date(execution.stopped_at!).toLocaleDateString()}`}>
                </div>
            </div>
        });
};
