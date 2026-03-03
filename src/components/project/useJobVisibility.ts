import { useState } from 'react'
import { ProjectData, TrackedProjectData } from '../../domain-models/models'
import { ProjectService } from '../../project/ProjectService'
import { collectUniqueJobs } from './projectUtils'

const projectService: ProjectService = new ProjectService()

export type JobVisibilityActions = {
    hiddenJobs: string[]
    onSelectAll: () => void
    onUnselectAll: () => void
    onSelectBuildJobs: () => void
    onSelectApprovalJobs: () => void
    toggleJobVisibility: (jobName: string) => void
}

export const useJobVisibility = (
    project: TrackedProjectData,
    projectData: ProjectData | undefined
): JobVisibilityActions => {
    const [hiddenJobs, setHiddenJobs] = useState<string[]>(project.hiddenJobs ?? [])

    const updateHidden = (newHidden: string[]): void => {
        projectService.setProjectHiddenJobs(project, newHidden)
        setHiddenJobs(newHidden)
    }

    const onSelectAll = (): void => updateHidden([])

    const onUnselectAll = (): void => {
        if (projectData) {
            updateHidden(collectUniqueJobs(projectData).map((j) => j.name))
        }
    }

    const onSelectBuildJobs = (): void => {
        if (projectData) {
            const approvalNames = collectUniqueJobs(projectData)
                .filter((j) => j.type === 'approval')
                .map((j) => j.name)
            updateHidden(approvalNames)
        }
    }

    const onSelectApprovalJobs = (): void => {
        if (projectData) {
            const buildNames = collectUniqueJobs(projectData)
                .filter((j) => j.type === 'build')
                .map((j) => j.name)
            updateHidden(buildNames)
        }
    }

    const toggleJobVisibility = (jobName: string): void => {
        const newHidden = hiddenJobs.includes(jobName)
            ? hiddenJobs.filter((n) => n !== jobName)
            : [...hiddenJobs, jobName]
        updateHidden(newHidden)
    }

    return { hiddenJobs, onSelectAll, onUnselectAll, onSelectBuildJobs, onSelectApprovalJobs, toggleJobVisibility }
}

