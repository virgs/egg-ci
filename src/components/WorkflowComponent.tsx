import { useState } from "react";
import { JobData, WorkflowData } from "../dashboard/DashboardRepository";
import { JobComponent } from "./JobComponent";
import { mapVersionControlFromString } from "../version-control/VersionControl";
import { VersionControlComponent } from "./VersionControlComponent";

type Props = {
    workflow: WorkflowData;
};

export const WorkflowComponent = (props: Props): JSX.Element => {
    const [jobs] = useState<JobData[]>(props.workflow.jobs)

    const versionControl = mapVersionControlFromString(props.workflow.project.vcsType);
    const versionControlComponent = versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>

    return <>
        <div className="mt-4" style={{ height: '2px', backgroundColor: 'var(--bs-light)' }}></div>
        <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
                <li className="breadcrumb-item d-flex align-items-center fs-4">
                    <a href={props.workflow.mostRecentPipeline.vcs.origin_repository_url}>
                        {versionControlComponent}
                        <span className="ms-1">{props.workflow.project.reponame}</span>
                    </a>
                </li>
                <li className="breadcrumb-item d-flex align-items-center fs-5 active">
                    {props.workflow.name}
                    <small className="ms-1 fs-6">(#{props.workflow.mostRecentPipeline.number})</small>
                </li>
            </ol>
        </nav>
        <div className="row m-0 row-cols-3 row-cols-lg-4 row-cols-xxl-5 gx-2 gy-4">
            {jobs
                .map((job, index) => <JobComponent key={`${job.name}.${index}`} job={job} index={index}></JobComponent>)}
        </div>
    </>;
};
