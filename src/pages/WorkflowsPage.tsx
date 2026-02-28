import { ReactElement, useEffect, useTransition, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProjectData, TrackedProjectData } from '../domain-models/models'
import { useProjectSynchedListener } from '../events/Events'
import { Config } from '../config'
import { SettingsRepository } from '../settings/SettingsRepository'
import { ConfigContext } from '../contexts/ConfigContext'
import { ProjectService } from '../project/ProjectService'
import { WorkflowsPageProvider } from './WorkflowsPageProvider'
import { useWorkflowsPage } from './WorkflowsPageContext'
import { WorkflowsToolbarComponent } from './WorkflowsToolbarComponent'
import { ProjectSectionComponent } from './ProjectSectionComponent'

const projectService = new ProjectService()
const settingsRepository = new SettingsRepository()

type ProjectPair = { tracked: TrackedProjectData; data: ProjectData }

const computeProjectPairs = (filterText: string): ProjectPair[] =>
    (projectService.loadTrackedProjects() || [])
        .filter((t) => t.enabled && !t.excluded)
        .map((t) => ({ tracked: t, data: projectService.loadProject(t) }))
        .filter(({ data }) => data !== undefined)
        .map(({ tracked, data }) => ({ tracked, data: data as ProjectData }))
        .filter(({ data }) =>
            Object.keys(data.workflows).join().concat(data.reponame).concat(data.username).includes(filterText)
        )

const WorkflowsPageInner = (): ReactElement => {
    const navigate = useNavigate()
    const [, startTransition] = useTransition()
    const { filterText } = useWorkflowsPage()

    const [configuration] = useState<Config>(settingsRepository.getConfiguration())
    const [projectPairs, setProjectPairs] = useState<ProjectPair[]>(() => computeProjectPairs(''))

    useEffect(() => {
        if (!settingsRepository.getApiToken()) {
            navigate('/settings')
            return
        }
        const enabled = (projectService.loadTrackedProjects() || []).filter((p) => p.enabled)
        if (enabled.length === 0) navigate('/projects')
    }, [navigate])

    useProjectSynchedListener(() => setProjectPairs(computeProjectPairs(filterText)))

    useEffect(() => {
        setProjectPairs(computeProjectPairs(filterText))
    }, [filterText])

    const handleHideJob = (tracked: TrackedProjectData, jobName: string): void => {
        const newHidden = [...new Set([...(tracked.hiddenJobs ?? []), jobName])]
        projectService.setProjectHiddenJobs(tracked, newHidden)
        setProjectPairs(computeProjectPairs(filterText))
    }

    const handleToggleCollapsed = (tracked: TrackedProjectData): void => {
        const newCollapsed = !(tracked.collapsed ?? false)
        projectService.setProjectCollapsed(tracked, newCollapsed)
        setProjectPairs((prev) =>
            prev.map((pair) =>
                pair.tracked === tracked ? { ...pair, tracked: { ...pair.tracked, collapsed: newCollapsed } } : pair
            )
        )
    }

    const allCollapsed = projectPairs.length > 0 && projectPairs.every(({ tracked }) => tracked.collapsed ?? false)

    const handleToggleAll = (): void => {
        const newCollapsed = !allCollapsed
        projectPairs.forEach(({ tracked }) => projectService.setProjectCollapsed(tracked, newCollapsed))
        startTransition(() => {
            setProjectPairs((prev) =>
                prev.map((pair) => ({ ...pair, tracked: { ...pair.tracked, collapsed: newCollapsed } }))
            )
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
            {projectPairs.map(({ tracked, data }) => (
                <ProjectSectionComponent
                    key={`${data.vcsType}/${data.username}/${data.reponame}`}
                    tracked={tracked}
                    data={data}
                    onHideJob={(jobName) => handleHideJob(tracked, jobName)}
                    onToggleCollapsed={handleToggleCollapsed}
                />
            ))}
        </ConfigContext.Provider>
    )
}

export const WorkflowsPage = (): ReactElement => (
    <WorkflowsPageProvider>
        <WorkflowsPageInner />
    </WorkflowsPageProvider>
)
