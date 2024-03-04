import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { CircleCiClient } from '../circleci/CircleCiClient'
import { MapVersionControlFromString, VersionControlComponent } from '../components/VersionControl'
import { SettingsData, SettingsRepository, TrackedProject } from '../settings/SettingsRepository'
import "./SettingsPage.css"

let circleCiClient: CircleCiClient
let settingsRepository: SettingsRepository
// setData(JSON.stringify(await circleCiClient.listPipelines('gh/Jackinthebox-IT/store-data-hub-api', 'main'), null, 2))
type Props = {
  onSettingsChanged: (settings: SettingsData) => void
}

export const SettingsPage = (props: Props): JSX.Element => {
  const [apiToken, setApiToken] = useState<string>('')
  const [projects, setProjects] = useState<TrackedProject[]>([])

  useEffect(() => {
    settingsRepository = new SettingsRepository();
    if (settingsRepository.data.token) {
      setApiToken(settingsRepository.data.token)
    }
    setProjects(settingsRepository.data.trackedProjects)
    settingsRepository.onChange(payload => props.onSettingsChanged(payload as SettingsData));
  }, [])

  const renderProjects = () => {
    return <ul className="list-group list-group-flush">
      {(projects.sort() || [])
        .map(trackedProject => {
          const project = trackedProject.data;
          const label = `${project.vcs_type}/${project.username}/${project.reponame}`;
          const versionControl = MapVersionControlFromString(project.vcs_type);
          console.log('key', label)
          const versionControlComponent = versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>

          return <li key={label} className="list-group-item d-flex align-items-center" style={{ height: '80px' }}>
            <input className="form-check-input" type="checkbox" id={label.concat('-checkbox')}
              checked={trackedProject.enabled}
              onChange={() => {
                if (trackedProject.enabled) {
                  settingsRepository.disableProject(trackedProject.slug)
                } else {
                  settingsRepository.enableProject(trackedProject.slug)
                }
                setProjects(settingsRepository.data.trackedProjects)
              }}
            />
            <label className="form-check-label ms-2" htmlFor={label.concat('-checkbox')}>
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
    settingsRepository.setApiToken(apiToken)
    circleCiClient = new CircleCiClient(apiToken)
    const projects = await circleCiClient.listProjects()
    projects
      .filter(async project => {
        const versionControl = MapVersionControlFromString(project.vcs_type);
        if (versionControl !== undefined) {
          const slug = `${new VersionControlComponent(versionControl).getSlug()}/${project.username}/${project.reponame}`;
          settingsRepository.addProject(slug, project)
          const pipelines = await circleCiClient.listPipelines(slug)
          console.log('pipelines', slug, typeof pipelines, pipelines)
          return true
        }
        return false
      })
    setProjects(settingsRepository.data.trackedProjects)
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
          <input type="password" className="form-control" id="apiToken" value={apiToken ?? ''}
            onChange={event => setApiToken(event.target.value)}
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
