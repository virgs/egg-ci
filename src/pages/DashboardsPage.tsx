import './DashboardsPage.scss'
import { faAnglesDown, faAnglesUp, faChevronDown, faChevronRight, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useEffect, useTransition, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorkflowComponent } from '../components/WorkflowComponent'
import { VersionControlComponent } from '../components/VersionControlComponent'
import { ProjectService } from '../project/ProjectService'
import { ProjectData, TrackedProjectData } from '../domain-models/models'
import { useProjectSynchedListener } from '../events/Events'
import { Config } from '../config'
import { SettingsRepository } from '../settings/SettingsRepository'
import { ConfigContext } from '../contexts/DashboardContext'
import { mapVersionControlFromString } from '../version-control/VersionControl'

const projectService: ProjectService = new ProjectService()

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

export const DashboardsPage = (): ReactElement => {
    const navigate = useNavigate()
    const [, startTransition] = useTransition()

    const [configuration] = useState<Config>(new SettingsRepository().getConfiguration())
    const [projectPairs, setProjectPairs] = useState<ProjectPair[]>(() => computeProjectPairs(''))
    const [filterText, setFilterText] = useState<string>('')

    useProjectSynchedListener(() => {
        setProjectPairs(computeProjectPairs(filterText))
    })

    useEffect(() => {
        const trackedProjects = projectService.loadTrackedProjects()
        const enabledProjects = (trackedProjects || []).filter((project) => project.enabled)

        if (enabledProjects.length === 0) {
            navigate(`../settings`, { relative: 'route' })
        }
    }, [navigate])

    const handleFilterChange = (text: string) => {
        setFilterText(text)
        setProjectPairs(computeProjectPairs(text))
    }

    const handleHideJob = (tracked: TrackedProjectData, jobName: string) => {
        const newHidden = [...new Set([...(tracked.hiddenJobs ?? []), jobName])]
        projectService.setProjectHiddenJobs(tracked, newHidden)
        setProjectPairs(computeProjectPairs(filterText))
    }

    const handleToggleCollapsed = (tracked: TrackedProjectData) => {
        const newCollapsed = !(tracked.collapsed ?? false)
        projectService.setProjectCollapsed(tracked, newCollapsed)
        setProjectPairs((prev) =>
            prev.map((pair) =>
                pair.tracked === tracked ? { ...pair, tracked: { ...pair.tracked, collapsed: newCollapsed } } : pair
            )
        )
    }

    const allCollapsed = projectPairs.length > 0 && projectPairs.every(({ tracked }) => tracked.collapsed ?? false)

    const handleToggleAll = () => {
        const newCollapsed = !allCollapsed
        projectPairs.forEach(({ tracked }) => projectService.setProjectCollapsed(tracked, newCollapsed))
        startTransition(() => {
            setProjectPairs((prev) =>
                prev.map((pair) => ({ ...pair, tracked: { ...pair.tracked, collapsed: newCollapsed } }))
            )
        })
    }

    const renderProjectContent = (tracked: TrackedProjectData, data: ProjectData) => {
        const workflowKeys = Object.keys(data.workflows)
        if (workflowKeys.length === 0) {
            return (
                <div className="py-4">
                    <p className="text-muted fst-italic">
                        No jobs found. Enable <strong>Include build jobs</strong> for this project in Settings to
                        display build jobs here.
                    </p>
                </div>
            )
        }
        return workflowKeys.map((workflowName, index) => {
            const workflow = data.workflows[workflowName]
            const hiddenJobs = tracked.hiddenJobs ?? []
            const visibleWorkflow = {
                ...workflow,
                jobs: workflow.jobs.filter((j) => !hiddenJobs.includes(j.name)),
            }
            const id = `workflow-${workflowName}-${index}-${workflow.latestId}`
            return (
                <div key={id} id={id} className="py-1">
                    <WorkflowComponent
                        project={data}
                        key={`workflow-child-${index}`}
                        workflow={visibleWorkflow}
                        onHideJob={(jobName) => handleHideJob(tracked, jobName)}
                        showProjectHeader={false}
                    ></WorkflowComponent>
                </div>
            )
        })
    }

    const renderWorkflows = () => {
        return projectPairs.map(({ tracked, data }) => {
            const isCollapsed = tracked.collapsed ?? false
            const projectKey = `${data.vcsType}/${data.username}/${data.reponame}`
            const versionControl = mapVersionControlFromString(data.vcsType)
            const versionControlIcon = versionControl ? new VersionControlComponent(versionControl).getIcon() : <></>
            return (
                <div key={projectKey}>
                    <div className="section-divider"></div>
                    <div className="project-header-toggle" onClick={() => handleToggleCollapsed(tracked)}>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item d-flex align-items-center">
                                    <FontAwesomeIcon
                                        icon={isCollapsed ? faChevronRight : faChevronDown}
                                        className="text-secondary chevron-icon"
                                    />
                                </li>
                                <li className="breadcrumb-item d-flex align-items-center fs-4">
                                    <a href={data.vcsUrl} onClick={(e) => e.stopPropagation()}>
                                        {versionControlIcon}
                                        <span className="ms-2">{data.reponame}</span>
                                    </a>
                                </li>
                                <li className="breadcrumb-item d-flex align-items-center fs-6">
                                    <small>{data.defaultBranch}</small>
                                </li>
                            </ol>
                        </nav>
                    </div>
                    <div className={`collapsible-grid${isCollapsed ? ' collapsible-grid--collapsed' : ''}`}>
                        <div className="collapsible-grid__inner">
                            {renderProjectContent(tracked, data)}
                        </div>
                    </div>
                </div>
            )
        })
    }

    return (
        <>
            <ConfigContext.Provider value={configuration}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <h3 className="mb-0">Workflows ({projectPairs.reduce((acc, { data }) => Object.keys(data.workflows).length + acc, 0)})</h3>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        title={allCollapsed ? 'Expand all' : 'Collapse all'}
                        onClick={handleToggleAll}
                    >
                        <FontAwesomeIcon icon={allCollapsed ? faAnglesDown : faAnglesUp} />
                    </button>
                </div>
                <div className="mb-3">
                    <div className="input-group w-100 d-flex align-items-center">
                        <label htmlFor="wokflowSearchLabel" className="form-label mb-0 me-3">
                            Filter
                        </label>
                        <input
                            type="text"
                            value={filterText}
                            onChange={(event) => handleFilterChange(event.target.value)}
                            className="form-control py-0 me-3"
                            id="wokflowSearchLabel"
                        />
                        <span className="input-group-text">
                            {' '}
                            <FontAwesomeIcon flip="horizontal" icon={faSearch} />
                        </span>
                    </div>
                </div>
                {renderWorkflows()}
            </ConfigContext.Provider>
        </>
    )
}
