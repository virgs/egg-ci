import React, { ReactElement, useCallback, useState } from 'react'
import { Form } from 'react-bootstrap'
import { useRelativeTime } from '../../time/UseRelativeTime'
import { useSyncCountdown } from '../../time/UseSyncCountdown'
import { useSyncQueue } from '../../contexts/SyncQueueContext'
import { DEFAULT_SYNC_FREQUENCY_MS, ProjectData, TrackedProjectData } from '../../domain-models/models'
import { emitNewNotification, useProjectSynchedListener } from '../../events/Events'
import { ProjectService } from '../../project/ProjectService'
import { mapVersionControlFromString } from '../../version-control/VersionControl'
import { VersionControlComponent } from '../VersionControlComponent'
import { faGripVertical } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './ProjectItemComponent.scss'
import { ProjectMenuComponent } from './ProjectMenuComponent'
import { ProjectJobListComponent } from './ProjectJobListComponent'
import { SyncFrequencyModalComponent } from './SyncFrequencyModalComponent'
import { useJobVisibility } from './useJobVisibility'

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
    const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(initialData?.lastSyncedAt)
    const [projectData, setProjectData] = useState<ProjectData | undefined>(initialData)
    const [isExpanded, setIsExpanded] = useState<boolean>(false)
    const [showFrequencyModal, setShowFrequencyModal] = useState<boolean>(false)
    const relativeTime = useRelativeTime(lastSyncedAt)
    const syncQueue = useSyncQueue()
    const id = getProjectLabel(props.project)
    const countdown = useSyncCountdown(syncQueue, id)
    const jobVis = useJobVisibility(props.project, projectData)

    const updateSyncing = useCallback(() => {
        const loaded = projectService.loadProject(props.project)
        setSyncing(props.project.enabled && !loaded)
        if (loaded?.lastSyncedAt) setLastSyncedAt(loaded.lastSyncedAt)
        if (loaded) setProjectData(loaded)
    }, [props.project])

    useProjectSynchedListener(() => updateSyncing())

    const updateProject = async (): Promise<void> => {
        setSyncing(true)
        props.onEnablingChange(true)
        await projectService.syncProject(props.project)
        emitNewNotification({ message: `Project ${id} synced successfully` })
    }

    const onSwitchChange = async (): Promise<void> => {
        if (props.project.enabled) {
            projectService.disableProject(props.project)
            syncQueue?.removeProject(id)
            props.onEnablingChange(false)
        } else {
            projectService.enableProject(props.project)
            syncQueue?.addProject({ ...props.project, enabled: true }, true)
            updateProject()
        }
    }

    const handleSyncFrequencyChange = (frequency: number): void => {
        projectService.setSyncFrequency(props.project, frequency)
        props.project.syncFrequency = frequency
        if (props.project.enabled) syncQueue?.addProject(props.project)
        setShowFrequencyModal(false)
    }

    const renderVersionControlIcon = (): ReactElement => {
        const vc = mapVersionControlFromString(props.project.vcsType)
        return vc ? new VersionControlComponent(vc).getIcon() : <></>
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
                    {props.project.enabled && countdown && (
                        <span className="ms-2 text-muted sync-countdown">{countdown}</span>
                    )}
                </label>
                <div onClick={(e) => e.stopPropagation()}>
                    <ProjectMenuComponent
                        project={props.project}
                        syncing={syncing}
                        relativeTime={relativeTime}
                        projectData={projectData}
                        onRefresh={updateProject}
                        onSelectAll={jobVis.onSelectAll}
                        onUnselectAll={jobVis.onUnselectAll}
                        onSelectBuildJobs={jobVis.onSelectBuildJobs}
                        onSelectApprovalJobs={jobVis.onSelectApprovalJobs}
                        onSetSyncFrequency={() => setShowFrequencyModal(true)}
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
                            hiddenJobs={jobVis.hiddenJobs}
                            onToggleJobVisibility={jobVis.toggleJobVisibility}
                        />
                    </div>
                </div>
            </div>
            <SyncFrequencyModalComponent
                show={showFrequencyModal}
                currentFrequency={props.project.syncFrequency ?? DEFAULT_SYNC_FREQUENCY_MS}
                projectLabel={`${props.project.username}/${props.project.reponame}`}
                onSave={handleSyncFrequencyChange}
                onCancel={() => setShowFrequencyModal(false)}
            />
        </div>
    )
}
