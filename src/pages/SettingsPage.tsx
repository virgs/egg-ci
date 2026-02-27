import { faInfoCircle, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useState } from 'react'
import { SettingsProjectComponent } from '../components/SettingsProjectComponent'
import { TrackedProjectData } from '../domain-models/models'
import { emitNewNotification, emitUserInformationChanged, useLoggedOutListener } from '../events/Events'
import { circleCiClient, initializeCircleCiClient } from '../gateway/CircleCiClient'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'
import { ProjectService } from '../project/ProjectService'
import { SettingsRepository } from '../settings/SettingsRepository'
import { useInterval } from '../time/UseInterval'
import './SettingsPage.scss'
import { ConfigurationComponent } from '../components/ConfigurationsComponent'
import { Config } from '../config'

const settingsRepository: SettingsRepository = new SettingsRepository()
const projectService: ProjectService = new ProjectService()

const getProjectLabel = (project: TrackedProjectData): string => {
    return `${project.vcsType}/${project.username}/${project.reponame}`
}

const AUTO_SYNC_TRACKED_PROJECTS_PERIOD_IN_MS = 30 * 1000 // 30 seconds

export const SettingsPage = (): ReactElement => {
    const [token, setToken] = useState<string>(() => settingsRepository.getApiToken() ?? '')
    const [, setUserInformation] = useState<UserInformationResponse | undefined>()
    const [projects, setProjects] = useState<TrackedProjectData[]>(
        () => projectService.loadTrackedProjects()?.filter((p) => !p.excluded) ?? []
    )

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
            const loadedProjects = projectService.loadTrackedProjects().filter((p) => !p.excluded)
            setProjects(loadedProjects)
        }
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
            } catch {
                emitNewNotification({ message: `Invalid token` })
            }
        }
    }

    useInterval(() => {
        refresh()
    }, AUTO_SYNC_TRACKED_PROJECTS_PERIOD_IN_MS)

    const onConfigurationsChange = (configuration: Config) => {
        settingsRepository.setConfiguration(configuration)
    }

    const handleMoveUp = (index: number) => {
        const updated = [...projects]
        ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
        projectService.reorderProjects(updated)
        setProjects(updated)
    }

    const handleMoveDown = (index: number) => {
        const updated = [...projects]
        ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
        projectService.reorderProjects(updated)
        setProjects(updated)
    }

    const handleExclude = (project: TrackedProjectData) => {
        projectService.excludeProject(project)
        setProjects((prev) => prev.filter((p) => p !== project))
    }

    const handleUnexcludeAll = () => {
        projectService.unexcludeAllProjects()
        setProjects(projectService.loadTrackedProjects() ?? [])
    }

    const renderProjects = () => {
        return (
            <div className="accordion">
                {(projects || []).map((project, index) => (
                    <SettingsProjectComponent
                        key={`settings-project-${getProjectLabel(project)}`}
                        onEnablingChange={updateComponentStates}
                        project={project}
                        index={index}
                        total={projects.length}
                        onMoveUp={() => handleMoveUp(index)}
                        onMoveDown={() => handleMoveDown(index)}
                        onExclude={() => handleExclude(project)}
                    ></SettingsProjectComponent>
                ))}
            </div>
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
                                <a
                                    className="ps-1 pe-3"
                                    href="https://app.circleci.com/settings/user/tokens"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <FontAwesomeIcon
                                        className="align-baseline text-x-small"
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
                        onUnexcludeAll={handleUnexcludeAll}
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
