import { createContext, useContext } from 'react'
import { WorkflowView } from '../settings/SettingsRepository'

export type WorkflowsPageContextType = {
    workflowView: WorkflowView
    filterText: string
    statusFilters: string[]
    handleViewChange: (view: WorkflowView) => void
    handleFilterChange: (text: string) => void
    handleStatusFiltersChange: (statuses: string[]) => void
}

export const WorkflowsPageContext = createContext<WorkflowsPageContextType | undefined>(undefined)

export const useWorkflowsPage = (): WorkflowsPageContextType => {
    const ctx = useContext(WorkflowsPageContext)
    if (!ctx) throw new Error('useWorkflowsPage must be used within WorkflowsPageProvider')
    return ctx
}
