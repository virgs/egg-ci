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

    useWorkflowSynchedListener(() => {
        loadDashboards()
    })

    useEffect(() => {
        const workflows = loadDashboards()
        if (workflows.length === 0) {
            navigate(`../settings`, { relative: 'route' })
        }
    }, [])

    const loadDashboards = () => {
        const trackedProjects = projectService.loadTrackedProjects()
        const workflows = trackedProjects
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
            <h2>Dashboards</h2>
            {renderWorkflows()}
        </>
    )
}
