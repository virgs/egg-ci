import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
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
                        <button
                            disabled={token.length === 0}
                            onClick={refresh}
                            type="button"
                            className="btn btn-primary"
                        >
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
