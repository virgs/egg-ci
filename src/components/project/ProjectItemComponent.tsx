import React, { ReactElement, useCallback, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useRelativeTime } from '../../time/UseRelativeTime'
import { ProjectData, TrackedProjectData } from '../../domain-models/models'
import { emitNewNotification, useProjectSynchedListener } from '../../events/Events'
import { ProjectService } from '../../project/ProjectService'
import { mapVersionControlFromString } from '../../version-control/VersionControl'
import { VersionControlComponent } from '../VersionControlComponent'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './ProjectItemComponent.scss'
import { ProjectMenuComponent } from './ProjectMenuComponent'
import { ProjectJobListComponent } from './ProjectJobListComponent'
import { collectUniqueJobs } from './projectUtils'

const getProjectLabel = (project: TrackedProjectData): string =>
    `${project.vcsType}/${project.username}/${project.reponame}`

type Props = {
    project: TrackedProjectData
    onEnablingChange: (enabled: boolean) => void
    onExclude: () => void
    isDragOver: boolean
    onDragStart: (e: React.DragEvent) => void
    onDragOver: (e: React.DragEvent) => void
    onDrop: (e: React.DragEvent) => void
    onDragEnd: () => void
}

const projectService: ProjectService = new ProjectService()

export const ProjectItemComponent = (props: Props): ReactElement => {
    const initialData = projectService.loadProject(props.project)
    const [syncing, setSyncing] = useState<boolean>(props.project.enabled && !initialData)
    const [hiddenJobs, setHiddenJobs] = useState<string[]>(props.project.hiddenJobs ?? [])
    const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(initialData?.lastSyncedAt)
    const [projectData, setProjectData] = useState<ProjectData | undefined>(initialData)
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const relativeTime = useRelativeTime(lastSyncedAt)
    const id = getProjectLabel(props.project)

    const updateSyncing = useCallback(() => {
        const loaded = projectService.loadProject(props.project)
        setSyncing(props.project.enabled && !loaded)
        if (loaded?.lastSyncedAt) setLastSyncedAt(loaded.lastSyncedAt)
        if (loaded) setProjectData(loaded)
    }, [props.project])

    useProjectSynchedListener(() => updateSyncing())

    const updateProject = async () => {
        setSyncing(true)
        props.onEnablingChange(true)
        await projectService.syncProject(props.project)
        emitNewNotification({ message: `Project ${id} synced successfully` })
    }

    const onSwitchChange = async () => {
        if (props.project.enabled) {
            projectService.disableProject(props.project)
            props.onEnablingChange(false)
        } else {
            projectService.enableProject(props.project)
            updateProject()
        }
    }

    const onSelectAll = () => {
        projectService.setProjectHiddenJobs(props.project, [])
        setHiddenJobs([])
    }

    const onUnselectAll = () => {
        if (projectData) {
            const allJobNames = collectUniqueJobs(projectData).map((j) => j.name)
            projectService.setProjectHiddenJobs(props.project, allJobNames)
            setHiddenJobs(allJobNames)
        }
    }

    const onSelectBuildJobs = () => {
        if (projectData) {
            const approvalJobNames = collectUniqueJobs(projectData)
                .filter((j) => j.type === 'approval')
                .map((j) => j.name)
            projectService.setProjectHiddenJobs(props.project, approvalJobNames)
            setHiddenJobs(approvalJobNames)
        }
    }

    const onSelectApprovalJobs = () => {
        if (projectData) {
            const buildJobNames = collectUniqueJobs(projectData)
                .filter((j) => j.type === 'build')
                .map((j) => j.name)
            projectService.setProjectHiddenJobs(props.project, buildJobNames)
            setHiddenJobs(buildJobNames)
        }
    }

    const toggleJobVisibility = (jobName: string) => {
        const newHidden = hiddenJobs.includes(jobName)
            ? hiddenJobs.filter((name) => name !== jobName)
            : [...hiddenJobs, jobName]
        projectService.setProjectHiddenJobs(props.project, newHidden)
        setHiddenJobs(newHidden)
    }

    const renderVersionControlIcon = () => {
        const versionControl = mapVersionControlFromString(props.project.vcsType)
        return versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>
    }

    return (
        <div
            className={`accordion-item${props.isDragOver ? ' project-item--drag-over' : ''}`}
            onDragOver={props.onDragOver}
            onDrop={props.onDrop}
        >
            <div
                className={`px-4 py-2 d-flex align-items-center gap-2 project-header-clickable${props.project.enabled ? ' project-item--enabled' : ''}`}
                onClick={() => setIsExpanded((prev) => !prev)}
            >
                <div
                    className="drag-handle flex-shrink-0"
                    draggable
                    onDragStart={props.onDragStart}
                    onDragEnd={props.onDragEnd}
                    onClick={(e) => e.stopPropagation()}
                >
                    <FontAwesomeIcon icon={faGripVertical} className="text-muted" />
                </div>
                <Form.Switch
                    id={id}
                    checked={props.project.enabled}
                    onChange={() => onSwitchChange()}
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                    className="mb-0"
                />
                <label className="form-check-label flex-grow-1 text-primary">
                    <span className="mx-2">{renderVersionControlIcon()}</span>
                    <span>{props.project.username}/{props.project.reponame}</span>
                </label>
                <div onClick={(e) => e.stopPropagation()}>
                    <ProjectMenuComponent
                        project={props.project}
                        syncing={syncing}
                        relativeTime={relativeTime}
                        projectData={projectData}
                        onRefresh={updateProject}
                        onSelectAll={onSelectAll}
                        onUnselectAll={onUnselectAll}
                        onSelectBuildJobs={onSelectBuildJobs}
                        onSelectApprovalJobs={onSelectApprovalJobs}
                        onExclude={props.onExclude}
                    />
                </div>
            </div>
            <div className={`collapsible-grid${isExpanded ? '' : ' collapsible-grid--collapsed'}`}>
                <div className="collapsible-grid__inner">
                    <div className="py-2 ps-5">
                        <ProjectJobListComponent
                            projectId={id}
                            projectData={projectData}
                            hiddenJobs={hiddenJobs}
                            onToggleJobVisibility={toggleJobVisibility}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
