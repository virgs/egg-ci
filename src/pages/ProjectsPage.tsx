import React, { ReactElement, useEffect, useState } from 'react'
import { Badge, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { ProjectItemComponent } from '../components/project/ProjectItemComponent'
import { TrackedProjectData } from '../domain-models/models'
import { emitNewNotification, emitUserInformationChanged } from '../events/Events'
import { circleCiClient, initializeCircleCiClient } from '../gateway/CircleCiClient'
import { ProjectService } from '../project/ProjectService'
import { SettingsRepository } from '../settings/SettingsRepository'
import { useInterval } from '../time/UseInterval'

const settingsRepository: SettingsRepository = new SettingsRepository()
const projectService: ProjectService = new ProjectService()

const AUTO_SYNC_PERIOD_IN_MS = 30 * 1000

const getProjectLabel = (project: TrackedProjectData): string =>
    `${project.vcsType}/${project.username}/${project.reponame}`

const computeExcludedCount = () => projectService.loadTrackedProjects()?.filter((p) => p.excluded).length ?? 0

export const ProjectsPage = (): ReactElement => {
    const navigate = useNavigate()

    useEffect(() => {
        if (!settingsRepository.getApiToken()) navigate('/settings')
    }, [navigate])

    const [projects, setProjects] = useState<TrackedProjectData[]>(
        () => projectService.loadTrackedProjects()?.filter((p) => !p.excluded) ?? []
    )
    const [excludedCount, setExcludedCount] = useState<number>(computeExcludedCount)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

    const syncProjects = async () => {
        const token = settingsRepository.getApiToken()
        if (!token) return
        initializeCircleCiClient(token)
        try {
            const [newUserInformation, userProjects] = await Promise.all([
                circleCiClient.getUserInformation(),
                projectService.listUserProjects(),
            ])
            settingsRepository.setUserInformation(newUserInformation)
            userProjects.forEach((project) => projectService.trackProject(project))
            emitUserInformationChanged(newUserInformation)
            const loaded = projectService.loadTrackedProjects()?.filter((p) => !p.excluded) ?? []
            setProjects(loaded)
            setExcludedCount(computeExcludedCount())
        } catch {
            emitNewNotification({ message: 'Failed to sync projects' })
        }
    }

    useInterval(syncProjects, AUTO_SYNC_PERIOD_IN_MS)

    const handleDragStart = (index: number) => (e: React.DragEvent) => {
        setDragIndex(index)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (index: number) => (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (dragOverIndex !== index) setDragOverIndex(index)
    }

    const handleDrop = (dropIndex: number) => (e: React.DragEvent) => {
        e.preventDefault()
        if (dragIndex === null || dragIndex === dropIndex) {
            setDragIndex(null)
            setDragOverIndex(null)
            return
        }
        const updated = [...projects]
        const [removed] = updated.splice(dragIndex, 1)
        updated.splice(dropIndex, 0, removed)
        projectService.reorderProjects(updated)
        setProjects(updated)
        setDragIndex(null)
        setDragOverIndex(null)
    }

    const handleDragEnd = () => {
        setDragIndex(null)
        setDragOverIndex(null)
    }

    const handleExclude = (project: TrackedProjectData) => {
        projectService.excludeProject(project)
        setProjects((prev) => prev.filter((p) => p !== project))
        setExcludedCount((prev) => prev + 1)
    }

    const handleUnexcludeAll = () => {
        projectService.unexcludeAllProjects()
        setProjects(projectService.loadTrackedProjects() ?? [])
        setExcludedCount(0)
    }

    const updateProjectList = () => {
        const loaded = projectService.loadTrackedProjects()?.filter((p) => !p.excluded) ?? []
        setProjects(loaded)
        setExcludedCount(computeExcludedCount())
    }

    return (
        <div>
            <div className="d-flex align-items-center justify-content-between mb-2">
                <h3 className="mb-0">Projects ({projects.length})</h3>
                <Button
                    size="sm"
                    variant="outline-secondary"
                    disabled={excludedCount === 0}
                    onClick={handleUnexcludeAll}
                >
                    Restore excluded projects
                    {excludedCount > 0 && <Badge bg="info" className="ms-2 fs-6">{excludedCount}</Badge>}
                </Button>
            </div>
            <div className="accordion">
                {projects.map((project, index) => (
                    <ProjectItemComponent
                        key={`project-${getProjectLabel(project)}`}
                        onEnablingChange={updateProjectList}
                        project={project}
                        onExclude={() => handleExclude(project)}
                        isDragOver={dragOverIndex === index && dragIndex !== index}
                        onDragStart={handleDragStart(index)}
                        onDragOver={handleDragOver(index)}
                        onDrop={handleDrop(index)}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>
        </div>
    )
}
