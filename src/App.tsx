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
import { config } from './config'

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

export const App = (): JSX.Element => {
    const autoUpdate = async () => {
        const projectService = new ProjectService()
        for await (let project of projectService.loadTrackedProjects().filter((project) => project.enabled)) {
            await projectService.syncProject(project)
            // emitNewNotification({ message: `Project ${project.reponame} successfully synchronized` })
        }

        console.log('auto sync')
    }

    useInterval(() => autoUpdate(), config.autoSyncInterval)

    useEffect(() => {
        const projectService = new ProjectService()
        const trackedProjects = projectService.loadTrackedProjects() || []
        trackedProjects
            .filter((project) => project.enabled && !projectService.loadProject(project))
            .map(async (project) => {
                //Keep downloading data
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
