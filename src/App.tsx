import './App.css'
import { NavBarComponent } from './components/NavBarComponent'
import { initializeCircleCiClient } from './gateway/CircleCiClient'
import { DashboardsPage } from './pages/DashboardsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SettingsRepository } from './settings/SettingsRepository'

import { RouterProvider, createHashRouter } from 'react-router-dom'
import { useInterval } from './time/UseInterval'
import { ProjectService } from './project/ProjectService'

//ghpage doesnt work with browser router: https://stackoverflow.com/a/71985764
const router = createHashRouter([
  {
    path: '/settings',
    element: (
      <>
        <SettingsPage />
      </>
    ),
  },
  {
    path: '/*',
    element: (
      <>
        <DashboardsPage />
      </>
    ),
  },
])

const settingsRepository: SettingsRepository = new SettingsRepository()
if (settingsRepository.getApiToken()) {
  initializeCircleCiClient(settingsRepository.getApiToken()!)
}

const autoSyncInterval = 1000 * 30; //30 seconds

export const App = (): JSX.Element => {
  useInterval(() => {
    // const projectService = new ProjectService()
    // projectService.loadTrackedProjects()
    //   .filter(project => project.enabled)
    //   .forEach(project => projectService.syncProjectData(project))
    console.log('auto sync')
  }, autoSyncInterval)
  return (
    <>
      <NavBarComponent />
      <div id="app" className="container py-2">
        <RouterProvider router={router} />
      </div>
    </>
  )
}
