import { NavBarComponent } from './components/NavBarComponent'
import { initializeCircleCiClient } from './gateway/CircleCiClient'
import { HomePage } from './pages/HomePage'
import { WorkflowsPage } from './pages/WorkflowsPage'
import { SettingsPage } from './pages/SettingsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { SettingsRepository } from './settings/SettingsRepository'

import { ReactElement, useEffect, useMemo, useState } from 'react'
import { Button } from 'react-bootstrap'
import { Navigate, RouterProvider, createHashRouter, useRouteError } from 'react-router-dom'
import { ToastsComponent } from './events/ToastsComponent'
import { useProfileChangedListener } from './events/Events'
import { ProfileRepository } from './profile/ProfileRepository'
import { ProjectService } from './project/ProjectService'
import { SyncQueue } from './project/SyncQueue'
import { SyncQueueContext } from './contexts/SyncQueueContext'
import { ConfirmationModalProvider } from './components/ConfirmationModalProvider.tsx'

const settingsRepository: SettingsRepository = new SettingsRepository()
const profileRepository = new ProfileRepository()
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
    const syncQueue = useMemo(() => new SyncQueue(projectService), [])
    const [activeProfileId, setActiveProfileId] = useState(() => profileRepository.getActiveProfile().id)

    useProfileChangedListener((profileId) => setActiveProfileId(profileId))

    useEffect(() => {
        syncQueue.stop()
        const enabled = projectService.loadTrackedProjects().filter((p) => p.enabled && !p.excluded)
        enabled.forEach((p) => syncQueue.addProject(p))
        return () => syncQueue.stop()
    }, [activeProfileId, syncQueue])

    return (
        <SyncQueueContext.Provider value={syncQueue}>
            <div id="app">
                <RouterProvider router={router}></RouterProvider>
            </div>
        </SyncQueueContext.Provider>
    )
}
