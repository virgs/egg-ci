import { IconDefinition, faArrowRotateRight, faPause, faThumbsUp } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useContext } from "react"
import { JobData, ProjectData } from "../domain-models/models"
import { emitNewNotification, emitProjectSynched } from "../events/Events"
import { circleCiClient } from "../gateway/CircleCiClient"
import { ProjectService } from "../project/ProjectService"
import { sleep } from "../time/Time"
import { ProjectContext } from "./WorkflowComponent"

type ActionButtonProps = {
    tooltip: string,
    icon: IconDefinition,
    onClick: () => void,
    message: string,
    disabled: boolean
}

const actionButtonProps = (project: ProjectData, job: JobData): ActionButtonProps => {
    switch (job.type) {
        case 'approval':
            return {
                tooltip: 'Approve job',
                icon: faThumbsUp,
                onClick: () => circleCiClient.approveJob(job.workflow.id, job.id),
                message: `Approving ${job.name} job`,
                disabled: job.status === 'success'

            }
        case 'build':
            if (job.status === 'running') {
                return {
                    tooltip: 'Cancel job',
                    icon: faPause,
                    onClick: () => circleCiClient.cancelJob(project, job.job_number!),
                    message: `Canceling ${job.name} job`,
                    disabled: false
                }
            }
    }
    return {
        message: `Running ${job.name} job`,
        icon: faArrowRotateRight,
        disabled: false,
        tooltip: 'Rerun job',
        onClick: () => circleCiClient.rerunJob(job.workflow.id, job.id)
    }
}


type Props = {
    job: JobData
}
export const JobActionButton = (props: Props): JSX.Element => {
    const project = useContext(ProjectContext)!

    const actionProps = actionButtonProps(project, props.job)
    return (
        <button
            type="button"
            data-bs-toggle="tooltip"
            data-bs-title={actionProps.tooltip}
            disabled={actionProps.disabled}
            className="btn btn-outline-primary py-0 px-2"
            onPointerDown={async () => {
                actionProps.onClick()
                emitNewNotification({ message: `Executing ${props.job.name} action` })
                await sleep(3 * 1000)
                const projectService = new ProjectService()
                const synced = await projectService.syncProject(project)
                emitProjectSynched({ project: synced })
            }}
            style={{ fontSize: '8px' }}
        >
            <FontAwesomeIcon icon={actionProps.icon}></FontAwesomeIcon>
        </button>
    )
}