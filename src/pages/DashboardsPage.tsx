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
            .filter(trackedProject => trackedProject.enabled)
            .filter(trackedProject => trackedProject.reponame.concat(trackedProject.username).includes(filterText))
            .map(trackedProject => projectService.loadProject(trackedProject))
            .filter(project => project !== undefined)
            .map(project => project as ProjectData)
            .filter(project => Object.keys(project.workflows).join().includes(filterText))
        setProjects(projects)

        return projects
    }

    const renderWorkflows = () => {
        return projects
            .map(project => Object.keys(project.workflows)
                .map((workflowName, index) => {
                    const id = `workflow-${workflowName}-${index}-${project.workflows[workflowName].latestId}`
                    return (
                        <div key={id} id={id} className='py-4'>
                            <WorkflowComponent project={project}
                                key={`workflow-child-${index}`}
                                workflow={project.workflows[workflowName]}></WorkflowComponent>
                        </div>
                    )
                }))
            .flat()
    }

    return (
        <>
            <h3>Projects ({projects.reduce((acc, project) => Object.keys(project.workflows).length + acc, 0)})</h3>
            <div className="row gx-2 py-4 align-items-center">
                <div className="col-auto">
                    <label htmlFor="searchLabel" className="visually-hidden"></label>
                    <input
                        type="text"
                        readOnly={true}
                        className="form-control-plaintext"
                        id="searchLabel"
                        value={'Filter'}
                    />
                </div>
                <div className="col">
                    <label htmlFor="searchInput" className="visually-hidden"></label>
                    <input
                        type="text"
                        className="form-control"
                        id="searchInput"
                        value={filterText}
                        onChange={(event) => setFilterText(event.target.value)}
                    />
                </div>
                <div className="col-auto">
                    <FontAwesomeIcon flip="horizontal" icon={faSearch} />
                </div>
            </div>
            {renderWorkflows()}
        </>
    )
}
