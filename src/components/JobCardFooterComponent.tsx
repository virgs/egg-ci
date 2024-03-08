import { useState } from "react";
import { ExecutionData } from "../dashboard/DashboardRepository";
import { WorkflowJob } from "../gateway/models/ListWorkflowJobsResponse";
import "./JobCardFooterComponent.scss";
import { getClassesFromJobExecution } from "./ClassesFromJobExecution";
import { config } from "../config";

type Props = {
    executions: ExecutionData[]
    onHighligthedExecutionIndexChanged: (index: number) => void,
    highligthedExecutionIndex: number
}

export const JobCardFooterComponent = (props: Props): JSX.Element => {
    const [executions] = useState<WorkflowJob[]>(JSON.parse(JSON.stringify(props.executions))
        .reverse())

    const gap = '3px'
    return <div className="card-footer p-1 pb-2 px-3 card-details">
        <strong className="text-body-secondary">
            <div>History</div>
        </strong>
        {executions
            .map((execution, index) => {
                const classes = getClassesFromJobExecution(execution)
                return (
                    <div
                        key={`job-history-${execution.id}`}
                        onPointerDown={() => props.onHighligthedExecutionIndexChanged(executions.length - index - 1)}
                        className="progress border"
                        role="progressbar"
                        aria-label="Job status"
                        style={{
                            cursor: 'pointer',
                            width: `calc((100% / ${config.jobHistoryColumnsPerLine}) - ${gap})`,
                            height: '10px',
                            display: 'inline-flex',
                            marginRight: gap,
                            borderRadius: '3px',
                            boxShadow: (executions.length - index - 1) !== props.highligthedExecutionIndex ? 'unset' : `0 0 3px 2px var(--bs-${classes.color})`
                        }}>
                        <div className={`progress-bar w-100 bg-${classes.color} ${classes.animated ? 'progress-bar-striped progress-bar-animated' : ''}`}></div>
                    </div>
                )
            })}
    </div>;
}
