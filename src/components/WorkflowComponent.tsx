import { useState } from 'react'
import { JobData, WorkflowData } from '../dashboard/DashboardRepository'
import { JobComponent } from './JobComponent'
import { mapVersionControlFromString } from '../version-control/VersionControl'
import { VersionControlComponent } from './VersionControlComponent'

type Props = {
    workflow: WorkflowData
}

export const WorkflowComponent = (props: Props): JSX.Element => {
    const [jobs] = useState<JobData[]>(props.workflow.jobs)

    const versionControl = mapVersionControlFromString(props.workflow.project.vcsType)
    const versionControlComponent = versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>
    const mostRecentPipeline = props.workflow.mostRecentPipeline
    const mostRecentWorkflow = props.workflow.mostRecentWorkflow

    const projectUrl = `https://app.circleci.com/pipelines/${mostRecentPipeline.vcs?.provider_name.toLowerCase()}/${props.workflow.project.username}/${props.workflow.project.reponame}`
    const workflowUrl = `${projectUrl}/${mostRecentPipeline.number}/workflows/${mostRecentWorkflow.id}`
    return (
        <>
            <div className="mt-4" style={{ height: '2px', backgroundColor: 'var(--bs-gray-200)' }}></div>
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item d-flex align-items-center fs-4">
                        <a href={mostRecentPipeline.vcs?.origin_repository_url}>
                            {versionControlComponent}
                            <span className="ms-2">{props.workflow.project.reponame}</span>
                        </a>
                    </li>
                    <li className="breadcrumb-item d-flex align-items-center fs-5 active">
                        {props.workflow.name}
                        <a href={workflowUrl}>
                            <small className="ms-1 fs-6">(#{mostRecentPipeline.number})</small>
                        </a>
                    </li>
                </ol>
            </nav>
            <div className="row m-0 row-cols-3 row-cols-lg-4 row-cols-xxl-5 gx-2 gy-4">
                {jobs.map((job, index) => (
                    <JobComponent
                        key={`${job.name}.${index}`}
                        job={job}
                        index={index}
                        projectUrl={projectUrl}
                    ></JobComponent>
                ))}
            </div>
        </>
    )
}
