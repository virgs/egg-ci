import { createEvent } from 'react-event-hook'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'
import { ProjectConfiguration } from '../project/ProjectConfiguration'

export type WorkflowSynchedEvent = {
    project: ProjectConfiguration
    workflowName: string
}

export type NotificationEvent = {
    message: string
}

export const { useUserInformationChangedListener, emitUserInformationChanged } =
    createEvent('user-information-changed')<UserInformationResponse>()
export const { useWorkflowSynchedListener, emitWorkflowSynched } =
    createEvent('workflow-synched')<WorkflowSynchedEvent>()
export const { useNewNotificationListener, emitNewNotification } = createEvent('new-notification')<NotificationEvent>()
export const { useLoggedOutListener, emitLoggedOut } = createEvent('logged-out')<void>()
