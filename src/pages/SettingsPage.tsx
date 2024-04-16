import { faInfoCircle, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { SettingsProjectComponent } from '../components/SettingsProjectComponent'
import { TrackedProjectData } from '../domain-models/models'
import { emitNewNotification, emitUserInformationChanged, useLoggedOutListener } from '../events/Events'
import { circleCiClient, initializeCircleCiClient } from '../gateway/CircleCiClient'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'
import { ProjectService } from '../project/ProjectService'
import { SettingsRepository } from '../settings/SettingsRepository'
import { useInterval } from '../time/UseInterval'
import './SettingsPage.css'
import { ConfigurationComponent } from '../components/ConfigurationsComponent'
import { Config } from '../config'

const settingsRepository: SettingsRepository = new SettingsRepository()
const projectService: ProjectService = new ProjectService()

const getProjectLabel = (project: TrackedProjectData): string => {
    return `${project.vcsType}/${project.username}/${project.reponame}`
}

const AUTO_SYNC_TRACKED_PROJECTS_PERIOD_IN_MS = 30 * 1000 // 30 seconds

export const SettingsPage = (): JSX.Element => {
    const [token, setToken] = useState<string>('')
    const [_, setUserInformation] = useState<UserInformationResponse | undefined>()
    const [projects, setProjects] = useState<TrackedProjectData[]>([])

    useLoggedOutListener(() => {
        setToken('')
        setUserInformation(undefined)
        setProjects([])
    })

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
            const loadedProjects = projectService
                .loadTrackedProjects()
                .sort((a, b) => getProjectLabel(a).localeCompare(getProjectLabel(b)))
            setProjects(loadedProjects)
        }
    }

    useInterval(() => {
        refresh()
    }, AUTO_SYNC_TRACKED_PROJECTS_PERIOD_IN_MS)

    useEffect(() => {
        updateComponentStates()
    }, [])

    const onConfigurationsChange = (configuration: Config) => {
        settingsRepository.setConfiguration(configuration)
    }

    const refresh = async () => {
        if (token.length > 0) {
            initializeCircleCiClient(token)
            try {
                const [newUserInformation, userProjects] = await Promise.all([
                    circleCiClient.getUserInformation(),
                    projectService.listUserProjects(),
                ])
                settingsRepository.setApiToken(token)
                settingsRepository.setUserInformation(newUserInformation)
                userProjects.forEach((project) => projectService.trackProject(project))
                updateComponentStates()
            } catch (error) {
                emitNewNotification({ message: `Invalid token` })
            }
        }
    }

    const renderProjects = () => {
        return (
            <ul className="list-group list-group-flush">
                {(projects || []).map((project, index) => (
                    <li key={`settings-project-${index}-${project.reponame}`} className="list-group-item p-0 m-0">
                        <SettingsProjectComponent
                            onEnablingChange={updateComponentStates}
                            project={project}
                        ></SettingsProjectComponent>
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <>
            <div>
                <h3>Token</h3>
                <div className="input-group mb-3 px-3">
                    <div className="w-100">
                        <div className="input-group w-100 d-flex align-items-center">
                            <label htmlFor="circleci-api-token" className="form-label mb-0">
                                <span>API Token</span>
                                <a className="ps-1 pe-3" href="https://app.circleci.com/settings/user/tokens">
                                    <FontAwesomeIcon
                                        className="align-baseline"
                                        style={{ fontSize: 'x-small' }}
                                        icon={faInfoCircle}
                                    />
                                </a>
                            </label>
                            <input
                                type="password"
                                value={token}
                                onChange={(event) => setToken(event.target.value)}
                                className="form-control py-2"
                                id="circleci-api-token"
                            />
                            <button
                                disabled={token.length === 0}
                                onClick={refresh}
                                type="button"
                                className="btn btn-primary py-2"
                            >
                                <FontAwesomeIcon icon={faRightToBracket} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <h3>Configurations</h3>
                <div className="px-3">
                    <ConfigurationComponent
                        onChange={onConfigurationsChange}
                        config={settingsRepository.getConfiguration()}
                    />
                </div>
            </div>
            <div>
                <h3>Projects ({projects.length})</h3>
                {renderProjects()}
            </div>
        </>
    )
}
