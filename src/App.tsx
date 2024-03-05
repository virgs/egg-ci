import { createContext, useState } from 'react'
import './App.css'
import { SettingsPage } from './pages/SettingsPage'
import { SettingsData } from './settings/SettingsRepository'

export let ProjectsContext: React.Context<SettingsData>

export const App = (): JSX.Element => {
  const [_settings, setSettings] = useState<SettingsData | undefined>(undefined)

  const onSettingsChanged = (newSettings: SettingsData) => {
    setSettings(newSettings)
    ProjectsContext = createContext(newSettings)
  }

  const render = () => {
    // if (settings) {
    return <>
      {/* <ProjectsContext.Provider value={settings!}> */}
      <div id='app' className='container'>
        <SettingsPage onSettingsChanged={onSettingsChanged} />
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
