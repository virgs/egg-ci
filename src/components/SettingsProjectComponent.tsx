import { ReactElement, useEffect, useState } from 'react'
import { ProjectData, TrackedProjectData } from '../domain-models/models'
import { emitNewNotification, useProjectSynchedListener } from '../events/Events'
import { ProjectService } from '../project/ProjectService'
import { mapVersionControlFromString } from '../version-control/VersionControl'
import { VersionControlComponent } from './VersionControlComponent'
import { faBars, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip } from 'bootstrap'
import { formatDuration } from '../time/Time'

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
    const [syncing, setSyncing] = useState<boolean>(false)
    const [includeBuildJobs, setIncludeBuildJobs] = useState<boolean>(props.project.includeBuildJobs ?? true)
    const [hiddenJobs, setHiddenJobs] = useState<string[]>(props.project.hiddenJobs ?? [])
    const [lastSyncedAt, setLastSyncedAt] = useState<string | undefined>(
        projectService.loadProject(props.project)?.lastSyncedAt
    )
    const [projectData, setProjectData] = useState<ProjectData | undefined>(
        projectService.loadProject(props.project) ?? undefined
    )
    const id = getProjectLabel(props.project)

    const updateSyncing = () => {
        const loaded = projectService.loadProject(props.project)
        setSyncing(props.project.enabled && !loaded)
        if (loaded?.lastSyncedAt) {
            setLastSyncedAt(loaded.lastSyncedAt)
        }
        if (loaded) {
            setProjectData(loaded)
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

        if (projectData) {
            const allJobs = collectUniqueJobs(projectData)
            const buildJobNames = allJobs.filter((j) => j.type === 'build').map((j) => j.name)
            let newHidden: string[]
            if (!newValue) {
                newHidden = [...new Set([...hiddenJobs, ...buildJobNames])]
            } else {
                newHidden = hiddenJobs.filter((name) => !buildJobNames.includes(name))
            }
            projectService.setProjectHiddenJobs(props.project, newHidden)
            setHiddenJobs(newHidden)
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

    const formatLastSyncedAt = (): string | undefined => {
        if (!lastSyncedAt) return undefined
        const ms = Date.now() - new Date(lastSyncedAt).getTime()
        const formatted = formatDuration(ms, 1)
        return formatted ? `${formatted} ago` : 'just now'
    }

    const renderMenu = () => {
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
        return allJobs.map(({ name }) => (
            <div key={name} className="form-check">
                <input
                    className="form-check-input"
                    type="checkbox"
                    id={`job-vis-${id}-${name}`}
                    checked={!hiddenJobs.includes(name)}
                    onChange={() => toggleJobVisibility(name)}
                />
                <label className="form-check-label" htmlFor={`job-vis-${id}-${name}`}>
                    {name}
                </label>
            </div>
        ))
    }

    const collapseId = `jobs-collapse-${id.replace(/[^a-zA-Z0-9]/g, '-')}`

    return (
        <div className="accordion-item">
            <div
                className="px-4 py-2 d-flex align-items-center justify-content-between gap-2"
                style={{ backgroundColor: props.project.enabled ? 'var(--bs-success-bg-subtle)' : 'unset' }}
            >
                <div className="form-check form-switch mb-0">
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
                <div className="d-flex align-items-center gap-3">
                    <button
                        className="btn btn-sm p-0 border-0 bg-transparent"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#${collapseId}`}
                        aria-expanded="false"
                        aria-controls={collapseId}
                        style={{ opacity: props.project.enabled ? 1 : 0.35, pointerEvents: props.project.enabled ? 'auto' : 'none' }}
                    >
                        <FontAwesomeIcon icon={faChevronDown} />
                    </button>
                    {renderMenu()}
                </div>
            </div>
            <div id={collapseId} className="accordion-collapse collapse">
                <div className="accordion-body py-2 ps-5">{renderJobList()}</div>
            </div>
        </div>
    )
}
