import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorkflowComponent } from '../components/WorkflowComponent'
import { ProjectService } from '../project/ProjectService'
import { ProjectData } from '../domain-models/models'
import { useProjectSynchedListener } from '../events/Events'

const projectService: ProjectService = new ProjectService()

export const DashboardsPage = (): JSX.Element => {
    const navigate = useNavigate()

    const [projects, setProjects] = useState<ProjectData[]>([])
    const [filterText, setFilterText] = useState<string>('')

    useProjectSynchedListener(() => {
        loadDashboards()
    })

    useEffect(() => {
        const trackedProjects = projectService.loadTrackedProjects()
        const enabledProjects = (trackedProjects || []).filter((project) => project.enabled)

        if (enabledProjects.length === 0) {
            navigate(`../settings`, { relative: 'route' })
        }
    }, [])

    useEffect(() => {
        loadDashboards()
    }, [filterText])

    const loadDashboards = () => {
        const trackedProjects = projectService.loadTrackedProjects()
        const projects = (trackedProjects || [])
            .filter((trackedProject) => trackedProject.enabled)
            .map((trackedProject) => projectService.loadProject(trackedProject))
            .filter((project) => project !== undefined)
            .map((project) => project as ProjectData)
            .filter((project) =>
                Object.keys(project.workflows)
                    .join()
                    .concat(project.reponame)
                    .concat(project.username)
                    .includes(filterText)
            )
        setProjects(projects)

        return projects
    }

    const renderWorkflows = () => {
        return projects
            .map((project) =>
                Object.keys(project.workflows).map((workflowName, index) => {
                    const id = `workflow-${workflowName}-${index}-${project.workflows[workflowName].latestId}`
                    return (
                        <div key={id} id={id} className="py-4">
                            <WorkflowComponent
                                project={project}
                                key={`workflow-child-${index}`}
                                workflow={project.workflows[workflowName]}
                            ></WorkflowComponent>
                        </div>
                    )
                })
            )
            .flat()
    }

    return (
        <>
            <h3>Workflows ({projects.reduce((acc, project) => Object.keys(project.workflows).length + acc, 0)})</h3>
            <div className="mb-3">
                <div className="input-group w-100 d-flex align-items-center">
                    <label htmlFor="wokflowSearchLabel" className="form-label mb-0 me-3">Filter</label>
                    <input type="text" className="form-control py-0 me-3" id="wokflowSearchLabel" />
                    <span className="input-group-text"> <FontAwesomeIcon flip="horizontal" icon={faSearch} /></span>
                </div>
            </div>
            {renderWorkflows()}
        </>
    )
}
