import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorkflowComponent } from '../components/WorkflowComponent'
import { ProjectService } from '../project/ProjectService'
import { ProjectData, TrackedProjectData } from '../domain-models/models'
import { useProjectSynchedListener } from '../events/Events'
import { Config } from '../config'
import { SettingsRepository } from '../settings/SettingsRepository'
import { ConfigContext } from '../contexts/DashboardContext'

const projectService: ProjectService = new ProjectService()

type ProjectPair = { tracked: TrackedProjectData; data: ProjectData }

const computeProjectPairs = (filterText: string): ProjectPair[] =>
    (projectService.loadTrackedProjects() || [])
        .filter((t) => t.enabled)
        .map((t) => ({ tracked: t, data: projectService.loadProject(t) }))
        .filter(({ data }) => data !== undefined)
        .map(({ tracked, data }) => ({ tracked, data: data as ProjectData }))
        .filter(({ data }) =>
            Object.keys(data.workflows).join().concat(data.reponame).concat(data.username).includes(filterText)
        )

export const DashboardsPage = (): ReactElement => {
    const navigate = useNavigate()

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

    const renderWorkflows = () => {
        return projectPairs
            .map(({ tracked, data }) => {
                const workflowKeys = Object.keys(data.workflows)
                if (workflowKeys.length === 0) {
                    return (
                        <div key={`no-jobs-${data.username}-${data.reponame}`} className="py-4">
                            <p className="text-muted fst-italic">
                                No jobs found for <strong>{data.username}/{data.reponame}</strong>. Enable{' '}
                                <strong>Include build jobs</strong> for this project in Settings to display build jobs
                                here.
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
                        <div key={id} id={id} className="py-4">
                            <WorkflowComponent
                                project={data}
                                key={`workflow-child-${index}`}
                                workflow={visibleWorkflow}
                                onHideJob={(jobName) => handleHideJob(tracked, jobName)}
                            ></WorkflowComponent>
                        </div>
                    )
                })
            })
            .flat()
    }

    return (
        <>
            <ConfigContext.Provider value={configuration}>
                <h3>Workflows ({projectPairs.reduce((acc, { data }) => Object.keys(data.workflows).length + acc, 0)})</h3>
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
