import { IconDefinition, faArrowRotateRight, faPause, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useContext, useEffect, useState } from 'react'
import { JobData, ProjectData } from '../../domain-models/models'
import { emitNewNotification, emitProjectSynched } from '../../events/Events'
import { circleCiClient } from '../../gateway/CircleCiClient'
import { ProjectService } from '../../project/ProjectService'
import { sleep } from '../../time/Time'
import { ProjectContext } from '../../contexts/ProjectContext'
import { Tooltip } from 'bootstrap'
import { ConfirmationModalComponent } from '../ConfirmationModalComponent'

type ActionButtonProps = {
    tooltip: string
    icon: IconDefinition
    onClick: () => void
    message: string
    disabled: boolean
}

const actionButtonProps = (project: ProjectData, job: JobData): ActionButtonProps => {
    switch (job.type) {
        case 'approval':
            return {
                tooltip: 'Approve job',
                icon: faThumbsUp,
                onClick: () => circleCiClient.approveJob(job.workflow.id, job.id),
                message: `Approving '${job.name}' job`,
                disabled: job.status === 'success',
            }
        case 'build':
            if (job.status === 'running') {
                return {
                    tooltip: 'Cancel job',
                    icon: faPause,
                    onClick: () => circleCiClient.cancelJob(project, job.job_number!),
                    message: `Canceling '${job.name}' job`,
                    disabled: false,
                }
            }
    }
    return {
        message: `Rerunning '${job.name}' job`,
        icon: faArrowRotateRight,
        disabled: false,
        tooltip: 'Rerun job',
        onClick: () => circleCiClient.rerunJob(job.workflow.id, job.id),
    }
}

type Props = {
    job: JobData
}
export const JobActionButton = (props: Props): ReactElement => {
    const project = useContext(ProjectContext)!
    const actionProps = actionButtonProps(project, props.job)
    const [showConfirm, setShowConfirm] = useState(false)

    const handleConfirm = async () => {
        setShowConfirm(false)
        actionProps.onClick()
        emitNewNotification({ message: actionProps.message })
        await sleep(3 * 1000)
        const projectService = new ProjectService()
        const synced = await projectService.syncProject(project)
        emitProjectSynched({ project: synced })
    }

    useEffect(() => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        Array.from(tooltipTriggerList).map(
            (tooltipTriggerEl) =>
                new Tooltip(tooltipTriggerEl, {
                    delay: {
                        show: 750,
                        hide: 100,
                    },
                })
        )
    }, [])

    return (
        <>
            {showConfirm && (
                <ConfirmationModalComponent
                    message={`Are you sure you want to ${actionProps.tooltip.toLowerCase()} '${props.job.name}'?`}
                    onConfirm={handleConfirm}
                    onCancel={() => setShowConfirm(false)}
                />
            )}
            <div
                className="p-1"
                onPointerDown={() => {
                    if (!actionProps.disabled) setShowConfirm(true)
                }}
                style={{
                    fontSize: '12px',
                    cursor: actionProps.disabled ? 'not-allowed' : 'pointer',
                    color: actionProps.disabled ? 'var(--bs-secondary)' : 'var(--bs-primary)',
                }}
            >
                <FontAwesomeIcon
                    data-bs-toggle="tooltip"
                    data-bs-placement="top"
                    data-bs-title={actionProps.tooltip}
                    icon={actionProps.icon}
                />
            </div>
        </>
    )
}
