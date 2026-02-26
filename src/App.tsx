import './App.css'
import { NavBarComponent } from './components/NavBarComponent'
import { initializeCircleCiClient } from './gateway/CircleCiClient'
import { DashboardsPage } from './pages/DashboardsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SettingsRepository } from './settings/SettingsRepository'

import { ReactElement } from 'react'
import { RouterProvider, createHashRouter } from 'react-router-dom'
import { ToastsComponent } from './events/ToastsComponent'
import { ProjectService } from './project/ProjectService'
import { sleep } from './time/Time'
import { useInterval } from './time/UseInterval'

const settingsRepository: SettingsRepository = new SettingsRepository()
if (settingsRepository.getApiToken()) {
    initializeCircleCiClient(settingsRepository.getApiToken()!)
}

const AppShell = ({ children }: { children: ReactElement }): ReactElement => {
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

const projectService = new ProjectService()

export const App = (): ReactElement => {
    const autoUpdate = async () => {
        const trackedProjects = projectService.loadTrackedProjects().filter((project) => project.enabled)
        for await (const project of trackedProjects) {
            projectService.syncProject(project)
            await sleep(settingsRepository.getConfiguration().autoSyncInterval)
        }
    }

    useInterval(
        () => autoUpdate(),
        settingsRepository.getConfiguration().autoSyncInterval *
            projectService.loadTrackedProjects().filter((project) => project.enabled).length
    )

    return (
        <div id="app">
            <RouterProvider router={router}></RouterProvider>
        </div>
    )
}
