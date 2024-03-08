import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { WorkflowComponent } from '../components/WorkflowComponent'
import { WorkflowData } from '../dashboard/DashboardRepository'
import { useWorkflowSynchedListener } from '../events/Events'
import { ProjectService } from '../project/ProjectService'

const projectService: ProjectService = new ProjectService()

export const DashboardsPage = (): JSX.Element => {
    const navigate = useNavigate()

    const [workflows, setWorkflows] = useState<WorkflowData[]>([])
    const [filterText, setFilterText] = useState<string>("")

    useWorkflowSynchedListener(() => {
        loadDashboards()
    })

    useEffect(() => {
        const workflows = loadDashboards()
        if (workflows.length === 0) {
            navigate(`../settings`, { relative: 'route' })
        }
    }, [])
    useEffect(() => {
        loadDashboards()
    }, [filterText])

    const loadDashboards = () => {
        const trackedProjects = projectService.loadTrackedProjects()
        const workflows = trackedProjects
            .filter(project => project.reponame
                .concat(project.username)
                .concat(project.username)
                .concat(project.workflows.join('')).includes(filterText))
            .filter(project => project.enabled)
            .map((project) => projectService.loadProjectWorkflows(project))
            .flat()
            .filter((workflow) => workflow !== undefined)
            .map((workflow) => workflow as WorkflowData)
        setWorkflows(workflows);
        return workflows
    }

    const renderWorkflows = () => {
        return workflows.map((workflow, index) => {
            const id = `workflow-${workflow.name}-${index}`
            return (
                <div key={id} id={id}>
                    <WorkflowComponent key={`workflow-child-${index}`} workflow={workflow}></WorkflowComponent>
                </div>
            )
        })
    }

    return (
        <>
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
                    <FontAwesomeIcon icon={faSearch} />
                </div>
            </div>
            <h2>Dashboards</h2>
            {renderWorkflows()}
        </>
    )
}
