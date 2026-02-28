import { IconDefinition, faArrowRotateRight, faPause, faPlay } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useContext, useEffect } from 'react'
import { JobData, ProjectData } from '../../domain-models/models'
import { emitNewNotification, emitProjectSynched } from '../../events/Events'
import { circleCiClient } from '../../gateway/CircleCiClient'
import { ProjectService } from '../../project/ProjectService'
import { sleep } from '../../time/Time'
import { ProjectContext } from '../../contexts/ProjectContext'
import { Tooltip } from 'bootstrap'

import { useConfirmationModal } from '../useConfirmationModal.tsx'

type ActionButtonProps = {
    tooltip: string
    icon: IconDefinition
    onClick: () => Promise<boolean>
    message: string
    disabled: boolean
}

const actionButtonProps = (project: ProjectData, job: JobData): ActionButtonProps => {
    switch (job.type) {
        case 'approval':
            return {
                tooltip: 'Approve job',
                icon: faPlay,
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
    const confirmationModal = useConfirmationModal()

    const handleConfirm = async () => {
        await actionProps.onClick()
        emitNewNotification({ message: actionProps.message })
        await sleep(2000)
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

    const jobActionConfirmationMessage =
        `Are you sure you want to <strong>${actionProps.tooltip.toLowerCase()}</strong> <strong>'${props.job.name}'</strong> ` +
        `(#${props.job.workflow.pipeline_number}) in <strong>${project.username}/${project.reponame}</strong>?`
    return (
        <>
            <div
                className="p-1"
                onPointerDown={async () => {
                    if (!actionProps.disabled) {
                        const approved = await confirmationModal({
                            message: jobActionConfirmationMessage,
                        })
                        if (!approved) {
                            console.log(`User cancelled ${actionProps.tooltip.toLowerCase()} action for job ${props.job.name}`)
                            return
                        }
                        await handleConfirm()
                    }
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
