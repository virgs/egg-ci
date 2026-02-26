import { ReactElement, useEffect, useState } from 'react'
import { TrackedProjectData } from '../domain-models/models'
import { emitNewNotification, useProjectSynchedListener } from '../events/Events'
import { ProjectService } from '../project/ProjectService'
import { mapVersionControlFromString } from '../version-control/VersionControl'
import { VersionControlComponent } from './VersionControlComponent'
import { faRefresh } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Tooltip } from 'bootstrap'

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
    const id = getProjectLabel(props.project)

    const updateSyncing = () => {
        setSyncing(props.project.enabled && !projectService.loadProject(props.project))
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

    const renderAction = () => {
        if (syncing) {
            return (
                <div className="spinner-grow spinner-grow-sm text-secondary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            )
        }
        if (props.project.enabled) {
            return (
                <FontAwesomeIcon
                    data-bs-toggle="tooltip"
                    data-bs-title="Refresh project"
                    style={{ cursor: 'pointer' }}
                    icon={faRefresh}
                    onPointerDown={() => updateProject()}
                ></FontAwesomeIcon>
            )
        }
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
            <div>{renderAction()}</div>
        </div>
    )
}
