import './WorkflowsPage.scss'
import { faAnglesDown, faAnglesUp, faChevronRight, faList, faSearch, faTableCellsLarge } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useEffect, useTransition, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorkflowComponent } from '../components/WorkflowComponent'
import { VersionControlComponent } from '../components/VersionControlComponent'
import { ProjectService } from '../project/ProjectService'
import { ProjectData, TrackedProjectData } from '../domain-models/models'
import { useProjectSynchedListener } from '../events/Events'
import { Config } from '../config'
import { WorkflowView, SettingsRepository } from '../settings/SettingsRepository'
import { ConfigContext } from '../contexts/ConfigContext'
import { mapVersionControlFromString } from '../version-control/VersionControl'

const projectService: ProjectService = new ProjectService()
const settingsRepository: SettingsRepository = new SettingsRepository()

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

export const WorkflowsPage = (): ReactElement => {
    const navigate = useNavigate()
    const [, startTransition] = useTransition()

    const [configuration] = useState<Config>(new SettingsRepository().getConfiguration())
    const [projectPairs, setProjectPairs] = useState<ProjectPair[]>(() => computeProjectPairs(''))
    const [filterText, setFilterText] = useState<string>('')
    const [workflowView, setWorkflowView] = useState<WorkflowView>(() => settingsRepository.getWorkflowView())

    const handleViewChange = (view: WorkflowView) => {
        settingsRepository.setWorkflowView(view)
        setWorkflowView(view)
    }

    useProjectSynchedListener(() => {
        setProjectPairs(computeProjectPairs(filterText))
    })

    useEffect(() => {
        if (!settingsRepository.getApiToken()) {
            navigate('/settings')
            return
        }
        const enabledProjects = (projectService.loadTrackedProjects() || []).filter((p) => p.enabled)
        if (enabledProjects.length === 0) {
            navigate('/projects')
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
            const id = `workflow-${workflowName}-${index}-${workflow.latestId}`
            return (
                <div key={id} id={id} className="py-1">
                    <WorkflowComponent
                        project={data}
                        key={`workflow-child-${index}`}
                        workflow={workflow}
                        hiddenJobs={tracked.hiddenJobs ?? []}
                        onHideJob={(jobName) => handleHideJob(tracked, jobName)}
                        showProjectHeader={false}
                        listView={workflowView === 'list'}
                    />
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
                    <div className="project-header-toggle" onClick={() => handleToggleCollapsed(tracked)}>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb mb-0 border-0">
                                <li className="breadcrumb-item d-flex align-items-center">
                                    <FontAwesomeIcon
                                        icon={faChevronRight}
                                        className={`text-secondary chevron-icon${isCollapsed ? '' : ' chevron-icon--open'}`}
                                    />
                                </li>
                                <li className="breadcrumb-item d-flex align-items-center fs-4">
                                    <a
                                        className="text-decoration-none"
                                        href={data.vcsUrl}
                                        onClick={(e) => e.stopPropagation()}
                                    >
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
                    <div className={`px-4 collapsible-grid${isCollapsed ? ' collapsible-grid--collapsed' : ''}`}>
                        <div className="collapsible-grid__inner">{renderProjectContent(tracked, data)}</div>
                    </div>
                    <hr className="border border-primary border-1 opacity-25" />
                </div>
            )
        })
    }

    return (
        <>
            <ConfigContext.Provider value={configuration}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                    <h3 className="mb-0">
                        Workflows ({projectPairs.reduce((acc, { data }) => Object.keys(data.workflows).length + acc, 0)}
                        )
                    </h3>
                </div>
                <div className="row g-2 align-items-center mb-3">
                    <div className="col-12 col-xl">
                        <div className="input-group input-group-sm">
                            <span className="input-group-text">
                                <FontAwesomeIcon icon={faSearch} />
                            </span>
                            <input
                                type="text"
                                value={filterText}
                                onChange={(event) => handleFilterChange(event.target.value)}
                                className="form-control"
                                placeholder="Search by name..."
                                id="wokflowSearchLabel"
                            />
                        </div>
                    </div>
                    <div className="col-12 col-xl-auto d-flex justify-content-end gap-2">
                        <div className="btn-group btn-group-sm">
                            <input
                                type="radio"
                                className="btn-check"
                                name="dashboard-view"
                                id="dashboard-view-grid"
                                checked={workflowView === 'grid'}
                                onChange={() => handleViewChange('grid')}
                            />
                            <label
                                className="btn btn-outline-secondary"
                                htmlFor="dashboard-view-grid"
                                title="Grid view"
                            >
                                <FontAwesomeIcon icon={faTableCellsLarge} />
                            </label>
                            <input
                                type="radio"
                                className="btn-check"
                                name="dashboard-view"
                                id="dashboard-view-list"
                                checked={workflowView === 'list'}
                                onChange={() => handleViewChange('list')}
                            />
                            <label
                                className="btn btn-outline-secondary"
                                htmlFor="dashboard-view-list"
                                title="List view"
                            >
                                <FontAwesomeIcon icon={faList} />
                            </label>
                        </div>
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            title={allCollapsed ? 'Expand all' : 'Collapse all'}
                            onClick={handleToggleAll}
                        >
                            <FontAwesomeIcon icon={allCollapsed ? faAnglesDown : faAnglesUp} />
                        </button>
                    </div>
                </div>
                {renderWorkflows()}
            </ConfigContext.Provider>
        </>
    )
}
