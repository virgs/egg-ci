import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { VersionControlComponent } from '../components/VersionControlComponent'
import { circleCiClient, initializeCircleCiClient } from '../gateway/CircleCiClient'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'
import { ProjectConfiguration } from '../project/ProjectConfiguration'
import { ProjectService } from '../project/ProjectService'
import { SettingsRepository } from '../settings/SettingsRepository'
import { mapVersionControlFromString } from '../version-control/VersionControl'
import './SettingsPage.css'
import { emitNewNotification, emitUserInformationChanged } from '../events/Events'
import { useInterval } from '../time/UseInterval'

const settingsRepository: SettingsRepository = new SettingsRepository()
const projectService: ProjectService = new ProjectService()

const getProjectLabel = (project: ProjectConfiguration): string => {
    return `${project.vcsType}/${project.username}/${project.reponame}`
}

const AUTO_SYNC_TRACKED_PROJECTS_PERIOD_IN_MS = 30 * 1000; // 30 seconds
export const SettingsPage = (): JSX.Element => {
    const [token, setToken] = useState<string>('')
    const [_, setUserInformation] = useState<UserInformationResponse | undefined>()
    const [projects, setProjects] = useState<(ProjectConfiguration)[]>([])

    const checkSyncingProjects = () => {
        const newLocal = projects
            .filter(project => project.enabled && projectService.loadProjectWorkflows(project)
                .some(workflow => workflow === undefined))
            .map(project => getProjectLabel(project))
        return newLocal
    }

    const [syncingProjects, setSyncingProjects] = useState<string[]>(checkSyncingProjects())

    const updateComponentStates = () => {
        if (settingsRepository.getApiToken()) {
            setToken(settingsRepository.getApiToken()!)
        }
        const newUserInformation = settingsRepository.getUserInformation()
        if (newUserInformation) {
            emitUserInformationChanged(newUserInformation)
            setUserInformation(newUserInformation)
        }
        if (projectService.loadTrackedProjects()) {
            setProjects(projectService.loadTrackedProjects()
                .sort((a, b) => getProjectLabel(a).localeCompare(getProjectLabel(b))))
        }
    }

    useInterval(() => {
        console.log('Autosync tracked projects')
        refresh();
    }, AUTO_SYNC_TRACKED_PROJECTS_PERIOD_IN_MS)

    useEffect(() => {
        updateComponentStates()
    }, [])

    const onSwitchChange = (project: ProjectConfiguration) => {
        const id = getProjectLabel(project)
        return () => {
            if (project.enabled) {
                projectService.disableProject(project)
            } else {
                setSyncingProjects(currentlySyncingProjects => currentlySyncingProjects.concat(id))
                projectService.enableProject(project)
                projectService.syncProjectData(project)
                    .then(() => {
                        setSyncingProjects(currentlySyncingProjects => currentlySyncingProjects.filter(item => item !== id))
                        emitNewNotification({ message: `Project ${project.reponame} successfuly synchronized` })
                    })
            }
            updateComponentStates()
        }
    }

    const refresh = async () => {
        if (token.length > 0) {
            initializeCircleCiClient(token)
            const [newUserInformation, projects] = await Promise.all([
                circleCiClient.getUserInformation(),
                projectService.listProjectsConfigurations(),
            ])
            settingsRepository.setApiToken(token)
            settingsRepository.setUserInformation(newUserInformation)
            projects.forEach((project) => projectService.trackProject(project))
            updateComponentStates()
        }
    }

    const renderProjects = () => {
        return (
            <ul className="list-group list-group-flush">
                {(projects || [])
                    .map(project => {
                        const renderVersionControlComponent = () => {
                            const versionControl = mapVersionControlFromString(project.vcsType)
                            if (versionControl) {
                                return new VersionControlComponent(versionControl).getIcon()
                            }
                            return <></>
                        }
                        const id = getProjectLabel(project)
                        const renderSpinner = () => {
                            if (syncingProjects.includes(id)) {
                                return <div className="spinner-grow spinner-grow-sm text-secondary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            }
                            return <></>
                        }
                        return (
                            <li key={id} className="list-group-item d-flex align-items-center justify-content-between"
                                style={{ backgroundColor: project.enabled ? 'var(--bs-success-bg-subtle)' : 'unset' }}>
                                <div className="form-check form-switch">
                                    <input className="form-check-input" type="checkbox" id={id}
                                        checked={project.enabled}
                                        onChange={onSwitchChange(project)} />
                                    <label className="form-check-label" htmlFor={id}>
                                        <span className="mx-2">{renderVersionControlComponent()}</span>
                                        <span>
                                            {project.username}/{project.reponame}
                                        </span>
                                    </label>
                                </div>
                                <div>{renderSpinner()}</div>
                            </li>
                        )
                    })}
            </ul>
        )
    }


    return (
        <>
            <div>
                <h3>Token</h3>
                <div className="row gx-2 py-4">
                    <div className="col-auto">
                        <label htmlFor="apiTokenLabel" className="visually-hidden"></label>
                        <input
                            type="text"
                            readOnly={true}
                            className="form-control-plaintext"
                            id="apiTokenLabel"
                            value={'API Token'}
                        />
                    </div>
                    <div className="col">
                        <label htmlFor="apiToken" className="visually-hidden"></label>
                        <input
                            type="password"
                            className="form-control"
                            id="apiToken"
                            value={token}
                            onChange={(event) => setToken(event.target.value)}
                        />
                    </div>
                    <div className="col-auto">
                        <button onClick={refresh} type="button" className="btn btn-primary">
                            <FontAwesomeIcon icon={faRightToBracket} />
                        </button>
                    </div>
                </div>
            </div>
            <div>
                <h3>Projects ({projects.length})</h3>
                {renderProjects()}
            </div>
        </>
    )
}

