import './App.css';
import { initializeCircleCiClient } from './gateway/CircleCiClient';
import { SettingsPage } from './pages/SettingsPage';
import { SettingsRepository } from './settings/SettingsRepository';

// export let ProjectsContext: React.Context<SettingsData>

const settingsRepository: SettingsRepository = new SettingsRepository();
// console.log(settingsRepository.data)
if (settingsRepository.getApiToken()) {
  initializeCircleCiClient(settingsRepository.getApiToken()!)
}

export const App = (): JSX.Element => {
  // const [_settings, setSettings] = useState<SettingsData | undefined>(undefined)

  // const onSettingsChanged = (newSettings: SettingsData) => {
  //   setSettings(newSettings)
  //   ProjectsContext = createContext(newSettings)
  // }

  const render = () => {
    // if (settings) {
    return <>
      {/* <ProjectsContext.Provider value={settings!}> */}
      <div id='app' className='container'>
        <SettingsPage />
      </div>
    </>
    // </ProjectsContext.Provider>
    // }
    // return <></>
  }

  return (
    <>
      {render()}
    </>
  )
}
