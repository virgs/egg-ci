import { useState } from "react";
import { JobData, WorkflowData } from "../dashboard/DashboardRepository";
import { JobExecutionHistoryComponent } from "./JobExecutionHistoryComponent";
import { WorkflowJob } from "../gateway/models/ListWorkflowJobsResponse";


type Props = {
    workflow: WorkflowData;
};

export const WorkflowComponent = (props: Props): JSX.Element => {
    const [jobs] = useState<JobData[]>(props.workflow.jobs)

    const getClassesFromExecution = (job: WorkflowJob): string => {
        switch (job.status) {
            case "success":
                return 'border-success'
            case "running":
                return 'border-warning'

            case "on_hold":
            case "blocked":
            case "queued":
            case "retried":
                return 'border-info'

            case "terminated-unknown":
            case "canceled":
            case "failed":
            case "not_running":
            case "infrastructure_fail":
            case "timedout":
                return 'border-danger'

            case "not_run":
            case "unauthorized":
                return 'border-light'

        }
    }



    const renderJobs = (): JSX.Element[] => {
        return jobs.map((job, index) => {

            const lastExecution = job.executions[job.executions.length - 1];
            const lastExecutionDurationInMinutes = (new Date(lastExecution.stopped_at!).getTime() - new Date(lastExecution.started_at!).getTime()) / (1000 * 60)
            return <div key={`${props.workflow.name}.${job.name}.${index}`} className="col pb-3">
                <div className={`card h-100 ${getClassesFromExecution(lastExecution)}`}
                >
                    <div className="card-header" style={{ height: '100px' }}>
                        <h4 className="card-title">{index + 1}. {job.name}</h4>
                    </div>
                    {/* <img src="..." className="card-img-top" alt="..." /> */}
                    <div className="card-body">

                        <div className="card-text">Last execution duration {lastExecutionDurationInMinutes.toFixed(0)} minutes</div>
                        <div className="card-text">Type {lastExecution.type}</div>
                        <p className="card-text"><small className="text-body-secondary">Last updated 3 mins ago</small></p>

                    </div>
                    <div className="card-footer text-start">
                        <div className="card-text"><small className="text-body-secondary">History</small></div>
                        <JobExecutionHistoryComponent job={job} historySize={5}></JobExecutionHistoryComponent>
                    </div>
                </div>
            </div>
        })
    }

    return <div>
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item d-flex align-items-center fs-4">{props.workflow.project.reponame}</li>
                <li className="breadcrumb-item d-flex align-items-center fs-5 active">{props.workflow.name}</li>
            </ol>
        </nav>
        <div className="row row-cols-3 row-cols-lg-4 row-cols-xxl-5 g-4">
            {renderJobs()}
        </div>
    </div>;
};
