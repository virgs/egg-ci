import { ReactElement, ReactNode, useState } from 'react'
import { WorkflowView, SettingsRepository } from '../settings/SettingsRepository'
import { WorkflowsPageContext } from './WorkflowsPageContext'

const settingsRepository = new SettingsRepository()

export const WorkflowsPageProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [workflowView, setWorkflowView] = useState<WorkflowView>(() => settingsRepository.getWorkflowView())
    const [filterText, setFilterText] = useState('')

    const handleViewChange = (view: WorkflowView): void => {
        settingsRepository.setWorkflowView(view)
        setWorkflowView(view)
    }

    const handleFilterChange = (text: string): void => setFilterText(text)

    return (
        <WorkflowsPageContext value={{ workflowView, filterText, handleViewChange, handleFilterChange }}>
            {children}
        </WorkflowsPageContext>
    )
}
