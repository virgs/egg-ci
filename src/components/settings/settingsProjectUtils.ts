import { ProjectData } from '../../domain-models/models'

export type UniqueJob = { name: string; type: 'build' | 'approval' }

export const collectUniqueJobs = (projectData: ProjectData): UniqueJob[] => {
    const seen = new Map<string, 'build' | 'approval'>()
    Object.values(projectData.workflows).forEach((workflow) => {
        workflow.jobs.forEach((jobContext) => {
            if (!seen.has(jobContext.name)) {
                seen.set(jobContext.name, jobContext.history[0]?.type ?? 'build')
            }
        })
    })
    return Array.from(seen.entries()).map(([name, type]) => ({ name, type }))
}
