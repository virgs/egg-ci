import { faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { CircleCiClient, circleCiClient, initializeCircleCiClient } from '../circleci/CircleCiClient'
import { MapVersionControlFromString, VersionControlComponent } from '../components/VersionControl'
import { SettingsData, SettingsRepository, TrackedProject } from '../settings/SettingsRepository'
import "./SettingsPage.css"

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
      {(projects || [])
        .map(trackedProject => {
          const project = trackedProject.data;
          const versionControl = MapVersionControlFromString(project.vcs_type);
          const versionControlComponent = versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>

          return <li key={trackedProject.slug} className="list-group-item d-flex align-items-center" style={{ height: '80px' }}>
            <input className="form-check-input" type="checkbox" id={trackedProject.slug.concat('-checkbox')}
              checked={trackedProject.enabled}
              onChange={async () => {
                if (trackedProject.enabled) {
                  settingsRepository.disableProject(trackedProject.slug)
                } else {
                  settingsRepository.enableProject(trackedProject.slug)

                  const pipelines = await circleCiClient.listPipelines(trackedProject.slug)
                  pipelines.items
                    .filter((_, index) => index === 0)
                    .forEach(pipeline => {
                      circleCiClient.listPipelineWorkflows(pipeline.id)
                    })


                }
                setProjects(settingsRepository.data.trackedProjects)
              }}
            />
            <label className="form-check-label ms-2" htmlFor={trackedProject.slug.concat('-checkbox')}>
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
    initializeCircleCiClient(apiToken)
    const projects = await circleCiClient.listProjects()
    projects
      .filter(async project => {
        const versionControl = MapVersionControlFromString(project.vcs_type);
        if (versionControl !== undefined) {
          const slug = `${new VersionControlComponent(versionControl).getSlug()}/${project.username}/${project.reponame}`;
          settingsRepository.addProject(slug, project)
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
