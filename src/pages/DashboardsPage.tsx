import { useEffect, useState } from "react";
import { WorkflowComponent } from "../components/WorkflowComponent";
import { WorkflowData } from "../dashboard/DashboardRepository";
import { ProjectService } from "../project/ProjectService";

const projectService: ProjectService = new ProjectService();

export const DashboardsPage = (): JSX.Element => {
    const [workflows, setWorkflows] = useState<WorkflowData[]>([])

    useEffect(() => {
        loadDashboards()
    }, [])

    const loadDashboards = () => {
        const trackedProjects = projectService.loadTrackedProjects()
        setWorkflows(trackedProjects
            .map(project => projectService.loadProjectWorkflows(project))
            .flat()
            .filter(workflow => workflow !== undefined)
            .map(workflow => workflow as WorkflowData))
    }

    const renderWorkflows = () => {
        return workflows
            .map((workflow, index) => {
                const id = `workflow-${workflow.name}`;
                return <div key={id} id={id}>
                    <WorkflowComponent key={`workflow-child-${index}`} workflow={workflow}></WorkflowComponent>
                </div>
            })
    }

    return <>
        <h1>Dashboards</h1>
        {renderWorkflows()}
    </>
}