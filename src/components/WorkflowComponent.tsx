import { ReactElement } from 'react'
import { ProjectData, WorkflowData } from '../domain-models/models'
import { mapVersionControlFromString } from '../version-control/VersionControl'
import { JobCardComponent } from './job-card/JobCardComponent'
import { VersionControlComponent } from './VersionControlComponent'
import { ProjectContext } from '../contexts/ProjectContext'
import { matchesStatusFilter } from '../pages/statusFilterUtils'
import './WorkflowComponent.scss'

type Props = {
    workflow: WorkflowData
    project: ProjectData
    onHideJob: (jobName: string) => void
    showProjectHeader?: boolean
    hiddenJobs?: string[]
    listView?: boolean
    statusFilters?: string[]
}

export const WorkflowComponent = (props: Props): ReactElement => {
    const showProjectHeader = props.showProjectHeader ?? true

    const versionControl = mapVersionControlFromString(props.project.vcsType)
    const versionControlComponent = versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>

    const projectUrl = props.project.ciUrl
    const workflowUrl = `${projectUrl}/${props.workflow.latestBuildNumber}/workflows/${props.workflow.latestId}`
    return (
        <>
            {showProjectHeader && <div className="section-divider"></div>}
            <nav aria-label="breadcrumb">
                <ol className="breadcrumb border-0 mb-0">
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
            <div
                className={`row m-0 gx-2 gy-2 ${props.listView ? 'row-cols-1' : 'row-cols-3 row-cols-lg-4 row-cols-xxl-5'}`}
            >
                <ProjectContext.Provider value={props.project}>
                    {props.workflow.jobs.map((job, index) => {
                        if ((props.hiddenJobs ?? []).includes(job.name)) return null
                        if (!matchesStatusFilter(job.history[0]?.status, props.statusFilters ?? [])) return null
                        return (
                            <JobCardComponent
                                key={`${props.workflow.latestId}.${index}`}
                                job={job}
                                jobOrder={index}
                                projectUrl={projectUrl}
                                onHideJob={props.onHideJob}
                                listView={props.listView}
                            />
                        )
                    })}
                </ProjectContext.Provider>
            </div>
        </>
    )
}
