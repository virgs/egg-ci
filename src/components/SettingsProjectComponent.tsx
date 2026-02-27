import { ReactElement, useCallback, useEffect, useState } from 'react'
import { useRelativeTime } from '../time/UseRelativeTime'
import { ProjectData, TrackedProjectData } from '../domain-models/models'
import { emitNewNotification, useProjectSynchedListener } from '../events/Events'
import { ProjectService } from '../project/ProjectService'
import { mapVersionControlFromString } from '../version-control/VersionControl'
import { VersionControlComponent } from './VersionControlComponent'
import { faBars, faScrewdriverWrench, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip } from 'bootstrap'
import './SettingsProjectComponent.scss'

const getProjectLabel = (project: TrackedProjectData): string => {
    return `${project.vcsType}/${project.username}/${project.reponame}`
}

type UniqueJob = { name: string; type: 'build' | 'approval' }

const collectUniqueJobs = (projectData: ProjectData): UniqueJob[] => {
    const seen = new Map<string, 'build' | 'approval'>()
    Object.values(projectData.workflows).forEach((workflow) => {
        workflow.jobs.forEach((jobContext) => {
            if (!seen.has(jobContext.name)) {
                seen.set(jobContext.name, jobContext.history[0]?.type ?? 'build')
            }
        })
    })
    return Array.from(seen.entries()).map(([name, type]) => ({ name, type }))
}

type Props = {
    project: TrackedProjectData
    onEnablingChange: (enabled: boolean) => void
}

const projectService: ProjectService = new ProjectService()

export const SettingsProjectComponent = (props: Props): ReactElement => {
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
        if (loaded?.lastSyncedAt) {
            setLastSyncedAt(loaded.lastSyncedAt)
        }
        if (loaded) {
            setProjectData(loaded)
        }
    }, [props.project])

    useEffect(() => {
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

    const handleHeaderClick = () => {
        if (props.project.enabled) {
            setIsExpanded((prev) => !prev)
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
            const allJobs = collectUniqueJobs(projectData)
            const approvalJobNames = allJobs.filter((j) => j.type === 'approval').map((j) => j.name)
            projectService.setProjectHiddenJobs(props.project, approvalJobNames)
            setHiddenJobs(approvalJobNames)
        }
    }

    const onSelectApprovalJobs = () => {
        if (projectData) {
            const allJobs = collectUniqueJobs(projectData)
            const buildJobNames = allJobs.filter((j) => j.type === 'build').map((j) => j.name)
            projectService.setProjectHiddenJobs(props.project, buildJobNames)
            setHiddenJobs(buildJobNames)
        }
    }

    const toggleJobVisibility = (jobName: string) => {
        let newHidden: string[]
        if (hiddenJobs.includes(jobName)) {
            newHidden = hiddenJobs.filter((name) => name !== jobName)
        } else {
            newHidden = [...hiddenJobs, jobName]
        }
        projectService.setProjectHiddenJobs(props.project, newHidden)
        setHiddenJobs(newHidden)
    }

    const renderMenu = () => {
        if (syncing) {
            return (
                <div className="spinner-grow spinner-grow-sm text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )
        }

        const lastSyncedLabel = relativeTime
        const isDisabled = !props.project.enabled

        return (
            <div className="dropdown">
                <FontAwesomeIcon
                    icon={faBars}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    className={isDisabled ? 'project-item__action--disabled' : undefined}
                />
                <ul className="dropdown-menu dropdown-menu-end">
                    {lastSyncedLabel && (
                        <li>
                            <span className="dropdown-item-text text-muted text-xs">
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
                        <button className="dropdown-item" type="button" onClick={onSelectAll}>
                            Select all
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" type="button" onClick={onUnselectAll}>
                            Unselect all
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" type="button" onClick={onSelectBuildJobs}>
                            Select build jobs
                        </button>
                    </li>
                    <li>
                        <button className="dropdown-item" type="button" onClick={onSelectApprovalJobs}>
                            Select approval jobs
                        </button>
                    </li>
                </ul>
            </div>
        )
    }

    const renderJobList = () => {
        if (!projectData) {
            return (
                <p className="text-muted fst-italic mb-0">
                    No data yet. Enable and sync the project first.
                </p>
            )
        }
        const allJobs = collectUniqueJobs(projectData)
        if (allJobs.length === 0) {
            return <p className="text-muted fst-italic mb-0">No jobs found for this project.</p>
        }
        return allJobs.map(({ name, type }: UniqueJob, index: number) => (
            <div key={name} className="form-check d-flex align-items-center gap-2">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id={`job-vis-${id}-${name}`}
                    checked={!hiddenJobs.includes(name)}
                    onChange={() => toggleJobVisibility(name)}
                />
                <label className="form-check-label flex-grow-1" htmlFor={`job-vis-${id}-${name}`}>
                    {index}. {name}
                </label>
                {type === 'build' ? (
                    <FontAwesomeIcon className="me-2 text-primary" icon={faScrewdriverWrench} />
                ) : (
                    <FontAwesomeIcon className="me-2 text-info" icon={faThumbsUp} />
                )}
            </div>
        ))
    }

    return (
        <div className="accordion-item">
            <div
                className={`px-4 py-2 d-flex align-items-center justify-content-between gap-2${props.project.enabled ? ' project-item--enabled project-header-clickable' : ''}`}
                onClick={handleHeaderClick}
            >
                <div className="form-check form-switch mb-0" onClick={(e) => e.stopPropagation()}>
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
                <div onClick={(e) => e.stopPropagation()}>
                    {renderMenu()}
                </div>
            </div>
            <div className={`collapsible-grid${isExpanded ? '' : ' collapsible-grid--collapsed'}`}>
                <div className="collapsible-grid__inner">
                    <div className="py-2 ps-5">{renderJobList()}</div>
                </div>
            </div>
        </div>
    )
}
