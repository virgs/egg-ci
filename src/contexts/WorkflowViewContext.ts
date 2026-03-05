import { createContext, useContext } from 'react'

export type WorkflowViewContextType = {
    workflowView: 'grid' | 'list' | 'compact'
}

export const WorkflowViewContext = createContext<WorkflowViewContextType | undefined>(undefined)

export const useWorkflowView = (): WorkflowViewContextType => {
    const ctx = useContext(WorkflowViewContext)
    if (!ctx) throw new Error('useWorkflowView must be used within WorkflowViewProvider')
    return ctx
}

