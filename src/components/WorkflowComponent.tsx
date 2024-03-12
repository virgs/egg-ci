import { useState } from 'react'
import { JobCardComponent } from './JobCardComponent'
import { mapVersionControlFromString } from '../version-control/VersionControl'
import { VersionControlComponent } from './VersionControlComponent'
import { WorkflowData, JobData, ProjectData } from '../domain-models/models'

type Props = {
    workflow: WorkflowData
    project: ProjectData
}

export const WorkflowComponent = (props: Props): JSX.Element => {
    const [jobs] = useState<JobData[]>(props.workflow.jobs)

    const versionControl = mapVersionControlFromString(props.project.vcsType)
    const versionControlComponent = versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>

    const projectUrl = props.project.vcsUrl
    const mostRecentJob = props.workflow.jobs[0]
    const workflowUrl = `${projectUrl}/${mostRecentJob.build_num}/workflows/${mostRecentJob.workflows.workflow_id}`
    return (
        <>
            <div style={{ height: '2px', backgroundColor: 'var(--bs-gray-200)' }}></div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item d-flex align-items-center fs-4">
                        <a href={props.project.vcsUrl}>
                            {versionControlComponent}
                            <span className="ms-2">{props.project.reponame}</span>
                        </a>
                    </li>
                    <li className="breadcrumb-item d-flex align-items-center fs-5 active">
                        {props.workflow.name}
                        <a href={workflowUrl}>
                            <small className="ms-1 fs-6">(#{mostRecentJob.build_num})</small>
                        </a>
                    </li>
                </ol>
            </nav>
            <div className="row m-0 row-cols-3 row-cols-lg-4 row-cols-xxl-5 gx-2 gy-4">
                {jobs.map((job, index) => (
                    <JobCardComponent
                        key={`${job.workflows.job_id}.${index}`}
                        job={job}
                        jobOrder={index}
                        projectUrl={projectUrl}
                    ></JobCardComponent>
                ))}
            </div>
        </>
    )
}
