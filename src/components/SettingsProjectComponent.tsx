import { ReactElement, useEffect, useState } from 'react'
import { TrackedProjectData } from '../domain-models/models'
import { emitNewNotification, useProjectSynchedListener } from '../events/Events'
import { ProjectService } from '../project/ProjectService'
import { mapVersionControlFromString } from '../version-control/VersionControl'
import { VersionControlComponent } from './VersionControlComponent'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip } from 'bootstrap'
import { formatDuration } from '../time/Time'

const getProjectLabel = (project: TrackedProjectData): string => {
    return `${project.vcsType}/${project.username}/${project.reponame}`
}

type Props = {
    project: TrackedProjectData
    onEnablingChange: (enabled: boolean) => void
}

const projectService: ProjectService = new ProjectService()

export const SettingsProjectComponent = (props: Props): ReactElement => {
    const [syncing, setSyncing] = useState<boolean>(false)
    const [includeBuildJobs, setIncludeBuildJobs] = useState<boolean>(props.project.includeBuildJobs ?? true)
    const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(
        projectService.loadProject(props.project)?.lastSyncedAt
    )
    const id = getProjectLabel(props.project)

    const updateSyncing = () => {
        const projectData = projectService.loadProject(props.project)
        setSyncing(props.project.enabled && !projectData)
        if (projectData?.lastSyncedAt) {
            setLastSyncedAt(projectData.lastSyncedAt)
        }
    }

    useEffect(() => {
        updateSyncing()
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        Array.from(tooltipTriggerList).map(
            (tooltipTriggerEl) =>
                new Tooltip(tooltipTriggerEl, {
                    delay: {
                        show: 750,
                        hide: 100,
                    },
                })
        )
    }, [])

    useProjectSynchedListener(() => {
        updateSyncing()
    })

    const renderVersionControlComponent = () => {
        const versionControl = mapVersionControlFromString(props.project.vcsType)
        if (versionControl) {
            return new VersionControlComponent(versionControl).getIcon()
        }
        return <></>
    }

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

    const onIncludeBuildJobsChange = () => {
        const newValue = !includeBuildJobs
        projectService.setProjectIncludeBuildJobs(props.project, newValue)
        setIncludeBuildJobs(newValue)
    }

    const formatLastSyncedAt = (): string | undefined => {
        if (!lastSyncedAt) return undefined
        const ms = Date.now() - new Date(lastSyncedAt).getTime()
        const formatted = formatDuration(ms, 1)
        return formatted ? `${formatted} ago` : 'just now'
    }

    const renderRightSide = () => {
        if (syncing) {
            return (
                <div className="spinner-grow spinner-grow-sm text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )
        }

        const lastSyncedLabel = formatLastSyncedAt()
        const isDisabled = !props.project.enabled

        return (
            <div className="dropdown">
                <FontAwesomeIcon
                    icon={faBars}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                        cursor: isDisabled ? 'default' : 'pointer',
                        opacity: isDisabled ? 0.35 : 1,
                        pointerEvents: isDisabled ? 'none' : 'auto',
                    }}
                />
                <ul className="dropdown-menu dropdown-menu-end">
                    {lastSyncedLabel && (
                        <li>
                            <span className="dropdown-item-text text-muted" style={{ fontSize: '0.75rem' }}>
                                Updated {lastSyncedLabel}
                            </span>
                        </li>
                    )}
                    <li>
                        <button className="dropdown-item" type="button" onClick={updateProject}>
                            Refresh
                        </button>
                    </li>
                    <li>
                        <hr className="dropdown-divider" />
                    </li>
                    <li>
                        <div className="dropdown-item">
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`includeBuildJobs-${id}`}
                                    checked={includeBuildJobs}
                                    onChange={onIncludeBuildJobsChange}
                                />
                                <label className="form-check-label" htmlFor={`includeBuildJobs-${id}`}>
                                    Include build jobs
                                </label>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        )
    }

    return (
        <div
            className="h-100 px-4 d-flex align-items-center justify-content-between"
            style={{ backgroundColor: props.project.enabled ? 'var(--bs-success-bg-subtle)' : 'unset' }}
        >
            <div className="form-check form-switch">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id={id}
                    checked={props.project.enabled}
                    onChange={() => onSwitchChange()}
                />
                <label className="form-check-label" htmlFor={id}>
                    <span className="mx-2">{renderVersionControlComponent()}</span>
                    <span>
                        {props.project.username}/{props.project.reponame}
                    </span>
                </label>
            </div>
            {renderRightSide()}
        </div>
    )
}
