import { NavBarComponent } from './components/NavBarComponent'
import { initializeCircleCiClient } from './gateway/CircleCiClient'
import { HomePage } from './pages/HomePage'
import { WorkflowsPage } from './pages/WorkflowsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { SettingsRepository } from './settings/SettingsRepository'

import { ReactElement } from 'react'
import { Button } from 'react-bootstrap'
import { Navigate, RouterProvider, createHashRouter, useRouteError } from 'react-router-dom'
import { ToastsComponent } from './events/ToastsComponent'
import { ProjectService } from './project/ProjectService'
import { useInterval } from './time/UseInterval'
import { ConfirmationModalProvider } from './components/ConfirmationModalProvider.tsx'

const settingsRepository: SettingsRepository = new SettingsRepository()
if (settingsRepository.getApiToken()) {
    initializeCircleCiClient(settingsRepository.getApiToken()!)
}

const AppShell = ({ children }: { children: ReactElement }): ReactElement => {
    return (
        <>
            <ConfirmationModalProvider>
                <NavBarComponent />
                <div className="app-scroll-container">
                    <ToastsComponent></ToastsComponent>
                    <div className="container py-2">{children}</div>
                </div>
            </ConfirmationModalProvider>
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
                <Button variant="primary" onClick={() => window.location.reload()}>
                    Reload
                </Button>
            </div>
        </AppShell>
    )
}

const router = createHashRouter([
    {
        path: '/home',
        element: (
            <AppShell>
                <HomePage />
            </AppShell>
        ),
        errorElement: <RouteErrorElement />,
    },
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
        path: '/projects',
        element: (
            <AppShell>
                <ProjectsPage />
            </AppShell>
        ),
        errorElement: <RouteErrorElement />,
    },
    {
        path: '/workflows',
        element: (
            <AppShell>
                <WorkflowsPage />
            </AppShell>
        ),
        errorElement: <RouteErrorElement />,
    },
    {
        path: '/*',
        element: <Navigate to="/home" replace />,
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
