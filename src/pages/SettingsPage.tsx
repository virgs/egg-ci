import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { VersionControlComponent } from '../components/VersionControlComponent'
import { circleCiClient, initializeCircleCiClient } from '../gateway/CircleCiClient'
import { ProjectService } from '../project/ProjectService'
import { SettingProject, SettingsData, SettingsRepository } from '../settings/SettingsRepository'
import "./SettingsPage.css"
import { mapVersionControlFromString } from '../version-control/VersionControl'

type Props = {
  onSettingsChanged: (settings: SettingsData) => void
}

const settingsRepository: SettingsRepository = new SettingsRepository();
const projectService: ProjectService = new ProjectService();

export const SettingsPage = (props: Props): JSX.Element => {
  const [token, setToken] = useState<string>('')
  const [projects, setProjects] = useState<SettingProject[]>([])

  useEffect(() => {
    if (settingsRepository.data) {
      setProjects(settingsRepository.data.projects)
    }
    if (settingsRepository.data.token) {
      initializeCircleCiClient(settingsRepository.data.token)
      setToken(settingsRepository.data.token)
    }
    settingsRepository.onChange(payload => {
      const castedPayload = payload as SettingsData
      setProjects(castedPayload.projects)
      setProjects(castedPayload.projects)
      props.onSettingsChanged(castedPayload)
    });
  }, [])

  const renderProjects = () => {
    return <ul className="list-group list-group-flush">
      {(projects || [])
        .map(project => {
          const versionControl = mapVersionControlFromString(project.vcs_type);
          const versionControlComponent = versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>

          return <li key={project.id} className="list-group-item d-flex align-items-center" style={{ height: '80px' }}>
            <input className="form-check-input" type="checkbox" id={project.id.concat('-checkbox')}
              checked={project.enabled}
              onChange={async () => {
                if (project.enabled) {
                  settingsRepository.disableProject(project.id)
                } else {
                  settingsRepository.enableProject(project.id)
                  projectService.sync(project)
                }
              }}
            />
            <label className="form-check-label ms-2" htmlFor={project.id.concat('-checkbox')}>
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
    settingsRepository.setApiToken(token)
    initializeCircleCiClient(token)
    const projects = await circleCiClient.listUserProjects()
    projects
      .filter(async project => {
        const versionControl = mapVersionControlFromString(project.vcs_type);
        if (versionControl !== undefined) {
          settingsRepository.addProject({
            enabled: false,
            vcs_type: project.vcs_type,
            reponame: project.reponame,
            username: project.username,
            branch: project.default_branch
          })
          return true
        }
        return false
      })

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
      {renderProjects()}
    </>
  )
}
