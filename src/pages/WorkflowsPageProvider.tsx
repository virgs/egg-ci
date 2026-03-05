import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProfileChangedListener } from '../events/Events'
import { WorkflowJobStatus } from '../gateway/models/ListWorkflowJobsResponse'
import { ProfileRepository } from '../profile/ProfileRepository'
import { WorkflowView, SettingsRepository } from '../settings/SettingsRepository'
import { WorkflowsPageContext } from './WorkflowsPageContext'
import { ALL_JOB_STATUSES, parseStatusFilters, serializeStatusFilters } from './statusFilterUtils'

const settingsRepository = new SettingsRepository()
const profileRepository = new ProfileRepository()
const STATUS_PARAM = 'statuses'

const computeInitialStatuses = (param: string | null): WorkflowJobStatus[] => {
    if (param !== null) return parseStatusFilters(param)
    return settingsRepository.getWorkflowStatusFilters() ?? ALL_JOB_STATUSES
}

export const WorkflowsPageProvider = ({ children }: { children: ReactNode }): ReactElement => {
    const [workflowView, setWorkflowView] = useState<WorkflowView>(() => settingsRepository.getWorkflowView())
    const [filterText, setFilterText] = useState<string>(() => settingsRepository.getWorkflowFilterText())
    const [searchParams, setSearchParams] = useSearchParams()

    const statusFilters = useMemo(
        () => computeInitialStatuses(searchParams.get(STATUS_PARAM)),
        [searchParams]
    )

    useEffect(() => {
        settingsRepository.setWorkflowStatusFilters(statusFilters)
    }, [statusFilters])

    const handleViewChange = (view: WorkflowView): void => {
        settingsRepository.setWorkflowView(view)
        setWorkflowView(view)
    }

    const handleFilterChange = (text: string): void => {
        settingsRepository.setWorkflowFilterText(text)
        setFilterText(text)
    }

    const handleStatusFiltersChange = (statuses: WorkflowJobStatus[]): void => {
        settingsRepository.setWorkflowStatusFilters(statuses)
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev)
                if (statuses.length === ALL_JOB_STATUSES.length) {
                    next.delete(STATUS_PARAM)
                } else {
                    next.set(STATUS_PARAM, serializeStatusFilters(statuses))
                }
                return next
            },
            { replace: true }
        )
    }

    useProfileChangedListener(() => {
        setWorkflowView(settingsRepository.getWorkflowView())
        setFilterText(settingsRepository.getWorkflowFilterText())

        const stored = settingsRepository.getWorkflowStatusFilters() ?? ALL_JOB_STATUSES
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev)
                if (stored.length === ALL_JOB_STATUSES.length) {
                    next.delete(STATUS_PARAM)
                } else {
                    next.set(STATUS_PARAM, serializeStatusFilters(stored))
                }
                return next
            },
            { replace: true }
        )
    })

    const activeProfile = profileRepository.getActiveProfile()

    return (
        <WorkflowsPageContext
            value={{
                workflowView,
                filterText,
                statusFilters,
                activeProfileId: activeProfile.id,
                handleViewChange,
                handleFilterChange,
                handleStatusFiltersChange,
            }}
        >
            {children}
        </WorkflowsPageContext>
    )
}
