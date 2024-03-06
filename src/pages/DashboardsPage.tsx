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
            .flat())
    }

    const renderWorkflows = () => {
        return workflows
            .map((workflow, index) => {
                console.log(workflow)
                return <div key={`workflow-child-${index}`} className="mb-4">
                    <WorkflowComponent workflow={workflow}></WorkflowComponent>
                </div>
            })
    }

    return <>{renderWorkflows()}</>
}