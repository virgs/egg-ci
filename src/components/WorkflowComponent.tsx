import { ReactElement } from 'react'
import { ProjectData, WorkflowData } from '../domain-models/models'
import { mapVersionControlFromString } from '../version-control/VersionControl'
import { JobCardComponent } from './JobCardComponent'
import { VersionControlComponent } from './VersionControlComponent'
import { ProjectContext } from '../contexts/ProjectContext'

type Props = {
    workflow: WorkflowData
    project: ProjectData
    onHideJob: (jobName: string) => void
    showProjectHeader?: boolean
}

export const WorkflowComponent = (props: Props): ReactElement => {
    const showProjectHeader = props.showProjectHeader ?? true

    const versionControl = mapVersionControlFromString(props.project.vcsType)
    const versionControlComponent = versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>

    const projectUrl = props.project.ciUrl
    const workflowUrl = `${projectUrl}/${props.workflow.latestBuildNumber}/workflows/${props.workflow.latestId}`
    return (
        <>
            {showProjectHeader && (
                <div style={{ height: '1px', backgroundColor: 'var(--bs-gray-200)', marginBottom: '4px' }}></div>
            )}
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb mb-0">
                    {showProjectHeader && (
                        <li className="breadcrumb-item d-flex align-items-center fs-4">
                            <a href={props.project.vcsUrl}>
                                {versionControlComponent}
                                <span className="ms-2">{props.project.reponame}</span>
                            </a>
                        </li>
                    )}
                    <li className="breadcrumb-item d-flex align-items-center fs-5 active">
                        {props.workflow.name}
                        <a href={workflowUrl}>
                            <small className="ms-1 fs-6">(#{props.workflow.latestBuildNumber})</small>
                        </a>
                    </li>
                    {showProjectHeader && (
                        <li className="breadcrumb-item d-flex align-items-center fs-6">
                            <small>{props.project.defaultBranch}</small>
                        </li>
                    )}
                </ol>
            </nav>
            <div className="row m-0 row-cols-3 row-cols-lg-4 row-cols-xxl-5 gx-2 gy-2">
                <ProjectContext.Provider value={props.project}>
                    {props.workflow.jobs.map((job, index) => (
                        <JobCardComponent
                            key={`${props.workflow.latestId}.${index}`}
                            job={job}
                            jobOrder={index}
                            projectUrl={projectUrl}
                            onHideJob={props.onHideJob}
                        ></JobCardComponent>
                    ))}
                </ProjectContext.Provider>
            </div>
        </>
    )
}
