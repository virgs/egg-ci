import { ReactElement, useEffect, useTransition, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProjectData, TrackedProjectData } from '../domain-models/models'
import { useProfileChangedListener, useProjectSynchedListener } from '../events/Events'
import { Config } from '../config'
import { SettingsRepository } from '../settings/SettingsRepository'
import { ConfigContext } from '../contexts/ConfigContext'
import { ProjectService } from '../project/ProjectService'
import { WorkflowsPageProvider } from './WorkflowsPageProvider'
import { useWorkflowsPage } from './WorkflowsPageContext'
import { WorkflowsToolbarComponent } from './WorkflowsToolbarComponent'
import { ProjectSectionComponent } from './ProjectSectionComponent'
import { hasEnabledProjects as hasEnabledTrackedProjects } from './workflowsPageUtils'
import './WorkflowsPage.scss'

const projectService = new ProjectService()
const settingsRepository = new SettingsRepository()

type ProjectPair = { tracked: TrackedProjectData; data: ProjectData }
type WorkflowsState = { projectPairs: ProjectPair[]; hasEnabledProjects: boolean }

const computeProjectPairs = (filterText: string, trackedProjects: TrackedProjectData[]): ProjectPair[] =>
    trackedProjects
        .filter((t) => t.enabled && !t.excluded)
        .map((t) => ({ tracked: t, data: projectService.loadProject(t) }))
        .filter(({ data }) => data !== undefined)
        .map(({ tracked, data }) => ({ tracked, data: data as ProjectData }))
        .filter(({ data }) =>
            Object.keys(data.workflows).join().concat(data.reponame).concat(data.username).includes(filterText)
        )

const computeWorkflowsState = (filterText: string): WorkflowsState => {
    const trackedProjects = projectService.loadTrackedProjects()
    return {
        projectPairs: computeProjectPairs(filterText, trackedProjects),
        hasEnabledProjects: hasEnabledTrackedProjects(trackedProjects),
    }
}

const WorkflowsPageInner = (): ReactElement => {
    const navigate = useNavigate()
    const [, startTransition] = useTransition()
    const { filterText, activeProfileId, workflowView } = useWorkflowsPage()

    const [configuration] = useState<Config>(settingsRepository.getConfiguration())
    const [{ projectPairs, hasEnabledProjects }, setWorkflowsState] = useState<WorkflowsState>(() =>
        computeWorkflowsState('')
    )

    useEffect(() => {
        if (!settingsRepository.getApiToken()) {
            navigate('/settings')
        }
    }, [navigate])

    useProjectSynchedListener(() => setWorkflowsState(computeWorkflowsState(filterText)))
    useProfileChangedListener(() => setWorkflowsState(computeWorkflowsState(filterText)))

    useEffect(() => {
        setWorkflowsState(computeWorkflowsState(filterText))
    }, [filterText])

    const handleHideJob = (tracked: TrackedProjectData, jobName: string): void => {
        const newHidden = [...new Set([...(tracked.hiddenJobs ?? []), jobName])]
        projectService.setProjectHiddenJobs(tracked, newHidden)
        setWorkflowsState(computeWorkflowsState(filterText))
    }

    const handleToggleCollapsed = (tracked: TrackedProjectData): void => {
        const newCollapsed = !(tracked.collapsed ?? false)
        projectService.setProjectCollapsed(tracked, newCollapsed)
        setWorkflowsState((prev) => ({
            ...prev,
            projectPairs: prev.projectPairs.map((pair) =>
                pair.tracked === tracked ? { ...pair, tracked: { ...pair.tracked, collapsed: newCollapsed } } : pair
            ),
        }))
    }

    const navigateToProjects = (): void => {
        navigate('/projects')
    }

    const renderContent = (): ReactElement => {
        if (!hasEnabledProjects) {
            return (
                <div className="alert alert-info workflows-empty-state" role="alert">
                    <h5 className="mb-1">No projects enabled yet</h5>
                    <p className="mb-3">Enable at least one project in the Projects page to see workflows here.</p>
                    <button type="button" className="btn btn-primary btn-sm" onClick={navigateToProjects}>
                        Enable projects
                    </button>
                </div>
            )
        }
        if (workflowView === 'compact') {
            return (
                <div className="row g-4 row-cols-1 row-cols-xxl-2">
                    {projectPairs.map(({ tracked, data }) => (
                        <div key={`${activeProfileId}:${data.vcsType}/${data.username}/${data.reponame}`} className="col">
                            <ProjectSectionComponent
                                tracked={tracked}
                                data={data}
                                onHideJob={(jobName) => handleHideJob(tracked, jobName)}
                                onToggleCollapsed={handleToggleCollapsed}
                            />
                        </div>
                    ))}
                </div>
            )
        }
        return (
            <>
                {projectPairs.map(({ tracked, data }) => (
                    <ProjectSectionComponent
                        key={`${activeProfileId}:${data.vcsType}/${data.username}/${data.reponame}`}
                        tracked={tracked}
                        data={data}
                        onHideJob={(jobName) => handleHideJob(tracked, jobName)}
                        onToggleCollapsed={handleToggleCollapsed}
                    />
                ))}
            </>
        )
    }

    const allCollapsed =
        hasEnabledProjects && projectPairs.length > 0 && projectPairs.every(({ tracked }) => tracked.collapsed ?? false)

    const handleToggleAll = (): void => {
        if (!hasEnabledProjects) {
            return
        }
        const newCollapsed = !allCollapsed
        projectPairs.forEach(({ tracked }) => projectService.setProjectCollapsed(tracked, newCollapsed))
        startTransition(() => {
            setWorkflowsState((prev) => ({
                ...prev,
                projectPairs: prev.projectPairs.map((pair) => ({
                    ...pair,
                    tracked: { ...pair.tracked, collapsed: newCollapsed },
                })),
            }))
        })
    }

    const workflowCount = projectPairs.reduce((acc, { data }) => Object.keys(data.workflows).length + acc, 0)

    return (
        <ConfigContext.Provider value={configuration}>
            <WorkflowsToolbarComponent
                workflowCount={workflowCount}
                allCollapsed={allCollapsed}
                onToggleAll={handleToggleAll}
            />
            {renderContent()}
        </ConfigContext.Provider>
    )
}

export const WorkflowsPage = (): ReactElement => (
    <WorkflowsPageProvider>
        <WorkflowsPageInner />
    </WorkflowsPageProvider>
)
