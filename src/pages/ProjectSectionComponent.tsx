import { faChevronRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement } from 'react'
import { WorkflowComponent } from '../components/WorkflowComponent'
import { VersionControlComponent } from '../components/VersionControlComponent'
import { ProjectData, TrackedProjectData } from '../domain-models/models'
import { mapVersionControlFromString } from '../version-control/VersionControl'
import { useWorkflowsPage } from './WorkflowsPageContext'
import './ProjectSectionComponent.scss'

type Props = {
    tracked: TrackedProjectData
    data: ProjectData
    onHideJob: (jobName: string) => void
    onToggleCollapsed: (tracked: TrackedProjectData) => void
}

const renderProjectContent = (
    tracked: TrackedProjectData,
    data: ProjectData,
    listView: boolean,
    onHideJob: (jobName: string) => void
): ReactElement => {
    const workflowKeys = Object.keys(data.workflows)
    if (workflowKeys.length === 0) {
        return (
            <div className="py-4">
                <p className="text-muted fst-italic">
                    No jobs found. Enable <strong>Include build jobs</strong> for this project in Settings to display
                    build jobs here.
                </p>
            </div>
        )
    }
    return (
        <>
            {workflowKeys.map((workflowName, index) => {
                const workflow = data.workflows[workflowName]
                const id = `workflow-${workflowName}-${index}-${workflow.latestId}`
                return (
                    <div key={id} id={id} className="py-1">
                        <WorkflowComponent
                            project={data}
                            key={`workflow-child-${index}`}
                            workflow={workflow}
                            hiddenJobs={tracked.hiddenJobs ?? []}
                            onHideJob={onHideJob}
                            showProjectHeader={false}
                            listView={listView}
                        />
                    </div>
                )
            })}
        </>
    )
}

export const ProjectSectionComponent = ({ tracked, data, onHideJob, onToggleCollapsed }: Props): ReactElement => {
    const { workflowView } = useWorkflowsPage()
    const isCollapsed = tracked.collapsed ?? false
    const projectKey = `${data.vcsType}/${data.username}/${data.reponame}`
    const versionControl = mapVersionControlFromString(data.vcsType)
    const versionControlIcon = versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>

    return (
        <div key={projectKey}>
            <div className="project-header-toggle" onClick={() => onToggleCollapsed(tracked)}>
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-0 border-0">
                        <li className="breadcrumb-item d-flex align-items-center">
                            <FontAwesomeIcon
                                icon={faChevronRight}
                                className={`text-secondary chevron-icon${isCollapsed ? '' : ' chevron-icon--open'}`}
                            />
                        </li>
                        <li className="breadcrumb-item d-flex align-items-center fs-4">
                            <a
                                className="text-decoration-none"
                                href={data.vcsUrl}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {versionControlIcon}
                                <span className="ms-2">{data.reponame}</span>
                            </a>
                        </li>
                        <li className="breadcrumb-item d-flex align-items-center fs-6">
                            <small>{data.defaultBranch}</small>
                        </li>
                    </ol>
                </nav>
            </div>
            <div className={`px-4 collapsible-grid${isCollapsed ? ' collapsible-grid--collapsed' : ''}`}>
                <div className="collapsible-grid__inner">
                    {renderProjectContent(tracked, data, workflowView === 'list', onHideJob)}
                </div>
            </div>
            <hr className="border border-primary border-1 opacity-25" />
        </div>
    )
}
