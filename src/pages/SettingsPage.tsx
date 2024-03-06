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
import "./SettingsPage.css"
import { emitUserInformationChanged } from '../events/Events'

const settingsRepository: SettingsRepository = new SettingsRepository();
const projectService: ProjectService = new ProjectService();

export const SettingsPage = (): JSX.Element => {
  const [token, setToken] = useState<string>('')
  const [_, setUserInformation] = useState<UserInformationResponse | undefined>()
  const [projects, setProjects] = useState<ProjectConfiguration[]>([])

  const updateComponentStates = () => {
    if (settingsRepository.getApiToken()) {
      setToken(settingsRepository.getApiToken()!)
    }
    if (settingsRepository.getUserInformation()) {
      setUserInformation(settingsRepository.getUserInformation())
    }
    if (projectService.loadTrackedProjects()) {
      setProjects(projectService.loadTrackedProjects())
    }
  }

  useEffect(() => {
    updateComponentStates()
  }, [])

  const renderProjects = () => {
    return <ul className="list-group list-group-flush">
      {(projects || [])
        .map(project => {
          const versionControl = mapVersionControlFromString(project.vcsType);
          const versionControlComponent = versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>
          const id = `${project.vcsType}/${project.username}/${project.reponame}`;
          return <li key={id} className="list-group-item d-flex align-items-center" style={{ height: '80px' }}>
            <input className="form-check-input" type="checkbox" id={id.concat('-checkbox')}
              checked={project.enabled}
              onChange={async () => {
                if (project.enabled) {
                  projectService.disableProject(project)
                } else {
                  projectService.enableProject(project)
                  projectService.syncProjectData(project)
                }
                updateComponentStates()
              }}
            />
            <label className="form-check-label ms-2" htmlFor={id.concat('-checkbox')}>
              <span className='mx-2'>{versionControlComponent}</span>
              <span>
                {project.username}/{project.reponame}
              </span>
            </label>
          </li>
        })}
    </ul>
  }

  const refresh = async () => {
    initializeCircleCiClient(token)
    const [userInformation, projects] = await Promise.all([circleCiClient.getUserInformation(), projectService.listProjectsConfigurations()]);
    console.log(userInformation, projects)
    settingsRepository.setApiToken(token)
    settingsRepository.setUserInformation(userInformation)
    emitUserInformationChanged(userInformation)
    projects.forEach(project => projectService.trackProject(project))
    updateComponentStates()
  }

  return (
    <>
      <div className="row gx-2 py-4">
        <div className="col-auto">
          <label htmlFor="apiTokenLabel" className="visually-hidden"></label>
          <input type="text" readOnly={true} className="form-control-plaintext" id="apiTokenLabel" value={"API Token"} />
        </div>
        <div className="col">
          <label htmlFor="apiToken" className="visually-hidden"></label>
          <input type="password" className="form-control" id="apiToken" value={token}
            onChange={event => setToken(event.target.value)}
          />
        </div>
        <div className="col-auto">
          <button onClick={refresh} type="button" className="btn btn-primary">
            <FontAwesomeIcon icon={faRightToBracket} />
          </button>
        </div>
      </div>
      <div>
        <h1>Projects</h1>
        {renderProjects()}
      </div>
    </>
  )
}
