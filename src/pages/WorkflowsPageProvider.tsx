import { ReactElement, ReactNode, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { WorkflowView, SettingsRepository } from '../settings/SettingsRepository'
import { WorkflowsPageContext } from './WorkflowsPageContext'
import { parseStatusFilters, serializeStatusFilters } from './statusFilterUtils'

const settingsRepository = new SettingsRepository()
const STATUS_PARAM = 'statuses'

export const WorkflowsPageProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [workflowView, setWorkflowView] = useState<WorkflowView>(() => settingsRepository.getWorkflowView())
    const [filterText, setFilterText] = useState('')
    const [searchParams, setSearchParams] = useSearchParams()

    const statusFilters = parseStatusFilters(searchParams.get(STATUS_PARAM))

    const handleViewChange = (view: WorkflowView): void => {
        settingsRepository.setWorkflowView(view)
        setWorkflowView(view)
    }

    const handleFilterChange = (text: string): void => setFilterText(text)

    const handleStatusFiltersChange = (statuses: string[]): void => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev)
                if (statuses.length === 0) {
                    next.delete(STATUS_PARAM)
                } else {
                    next.set(STATUS_PARAM, serializeStatusFilters(statuses))
                }
                return next
            },
            { replace: true }
        )
    }

    return (
        <WorkflowsPageContext
            value={{ workflowView, filterText, statusFilters, handleViewChange, handleFilterChange, handleStatusFiltersChange }}
        >
            {children}
        </WorkflowsPageContext>
    )
}
