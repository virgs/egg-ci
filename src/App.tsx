import './App.css'
import { NavBarComponent } from './components/NavBarComponent'
import { initializeCircleCiClient } from './gateway/CircleCiClient'
import { DashboardsPage } from './pages/DashboardsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SettingsRepository } from './settings/SettingsRepository'

import { RouterProvider, createHashRouter } from 'react-router-dom'
import { ToastsComponent } from './events/ToastsComponent'
import { useInterval } from './time/UseInterval'
import { useEffect } from 'react'
import { ProjectService } from './project/ProjectService'
import { emitNewNotification } from './events/Events'

const settingsRepository: SettingsRepository = new SettingsRepository()
if (settingsRepository.getApiToken()) {
  initializeCircleCiClient(settingsRepository.getApiToken()!)
}

const AppShell = ({ children }: { children: JSX.Element }): JSX.Element => {
  return (
    <>
      <NavBarComponent />
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <ToastsComponent></ToastsComponent>
        <div className="container py-2">{children}</div>
      </div>
    </>
  )
}

//ghpage doesnt work with browser router: https://stackoverflow.com/a/71985764
const router = createHashRouter([
  {
    path: '/settings',
    element: (
      <AppShell>
        <SettingsPage />
      </AppShell>
    ),
  },
  {
    path: '/*',
    element: (
      <AppShell>
        <DashboardsPage />
      </AppShell>
    ),
  },
])

const autoSyncInterval = 1000 * 30 //30 seconds

export const App = (): JSX.Element => {
  useInterval(() => {
    const projectService = new ProjectService()
    projectService.loadTrackedProjects()
      .filter(project => project.enabled)
      .forEach(async project => {
        // await projectService.syncProject(project)
        // emitNewNotification({ message: `Project ${project.reponame} successfully synchronized` })
      })

    console.log('auto sync')
  }, autoSyncInterval)

  useEffect(() => {
    const projectService = new ProjectService()
    const trackedProjects = projectService.loadTrackedProjects() || []
    trackedProjects
      .filter((project) => project.enabled && !projectService.loadProject(project))
      .forEach(async (project) => { //Keep downloading data
        await projectService.syncProject(project)
        emitNewNotification({ message: `Project ${project.reponame} successfully synchronized` })
      })
  }, [])

  return (
    <>
      <div
        id="app"
        style={{
          height: '100svh',
          display: 'flex',
          flexFlow: 'column',
        }}
      >
        <RouterProvider router={router}></RouterProvider>
      </div>
    </>
  )
}
