import { useEffect, useState } from 'react'
import { VersionControlComponent } from './VersionControlComponent'
import { ProjectConfiguration } from '../project/ProjectConfiguration'
import { mapVersionControlFromString } from '../version-control/VersionControl'
import { ProjectService } from '../project/ProjectService'
import { emitNewNotification, useWorkflowSynchedListener } from '../events/Events'

const getProjectLabel = (project: ProjectConfiguration): string => {
    return `${project.vcsType}/${project.username}/${project.reponame}`
}

type Props = {
    project: ProjectConfiguration,
    onEnablingChange: (enabled: boolean) => void
}

const projectService: ProjectService = new ProjectService()

export const SettingsProjectComponent = (props: Props): JSX.Element => {
    const [syncing, setSyncing] = useState<boolean>(false)
    const id = getProjectLabel(props.project)

    const updateSyncing = () => {
        setSyncing(props.project.enabled && !projectService.everyWorkflowOfProjectIsUpToDate(props.project))
    }

    useEffect(() => {
        updateSyncing()
    }, [])

    useWorkflowSynchedListener(() => {
        updateSyncing()
    })

    const renderVersionControlComponent = () => {
        const versionControl = mapVersionControlFromString(props.project.vcsType)
        if (versionControl) {
            return new VersionControlComponent(versionControl).getIcon()
        }
        return <></>
    }

    const renderSpinner = () => {
        if (syncing) {
            return <div className="spinner-grow spinner-grow-sm text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        }
        return <></>
    }

    const onSwitchChange = async () => {
        // props.onEnablingChange(!props.project.enabled)
        if (props.project.enabled) {
            projectService.disableProject(props.project)
            props.onEnablingChange(false)
        } else {
            projectService.enableProject(props.project)
            setSyncing(true)
            props.onEnablingChange(true)
            await projectService.syncProjectData(props.project)
            emitNewNotification({ message: `Project ${id} synced successfully` })
        }
    }

    return <div className="h-100 px-4 d-flex align-items-center justify-content-between"
        style={{ backgroundColor: props.project.enabled ? 'var(--bs-success-bg-subtle)' : 'unset' }}>
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
        <div>{renderSpinner()}</div>
    </div>
}
