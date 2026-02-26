import './App.css'
import { NavBarComponent } from './components/NavBarComponent'
import { initializeCircleCiClient } from './gateway/CircleCiClient'
import { DashboardsPage } from './pages/DashboardsPage'
import { SettingsPage } from './pages/SettingsPage'
import { SettingsRepository } from './settings/SettingsRepository'

import { ReactElement } from 'react'
import { RouterProvider, createHashRouter, useRouteError } from 'react-router-dom'
import { ToastsComponent } from './events/ToastsComponent'
import { ProjectService } from './project/ProjectService'
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

const RouteErrorElement = (): ReactElement => {
    const error = useRouteError() as Error
    return (
        <AppShell>
            <div className="text-center py-5">
                <h4 className="mb-2">Something went wrong</h4>
                {error?.message && <p className="text-muted mb-4">{error.message}</p>}
                <button className="btn btn-primary" onClick={() => window.location.reload()}>
                    Reload
                </button>
            </div>
        </AppShell>
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
        errorElement: <RouteErrorElement />,
    },
    {
        path: '/*',
        element: (
            <AppShell>
                <DashboardsPage />
            </AppShell>
        ),
        errorElement: <RouteErrorElement />,
    },
])

const projectService = new ProjectService()

export const App = (): ReactElement => {
    const autoUpdate = async () => {
        const trackedProjects = projectService.loadTrackedProjects().filter((project) => project.enabled)
        for (const project of trackedProjects) {
            await projectService.syncProject(project)
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
