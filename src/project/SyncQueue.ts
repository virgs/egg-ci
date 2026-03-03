import { DEFAULT_SYNC_FREQUENCY_MS, TrackedProjectData } from '../domain-models/models'
import { ProjectService } from './ProjectService'

export type SyncQueueEntry = {
    projectId: string
    project: TrackedProjectData
    nextSyncAt: number
}

export type SyncQueueListener = () => void

const projectId = (p: TrackedProjectData): string =>
    `${p.vcsType}/${p.username}/${p.reponame}`

export class SyncQueue {
    private queue: SyncQueueEntry[] = []
    private timerId: ReturnType<typeof setTimeout> | null = null
    private syncing = false
    private listeners: Set<SyncQueueListener> = new Set()
    private readonly projectService: ProjectService

    public constructor(projectService: ProjectService) {
        this.projectService = projectService
    }

    public subscribe(listener: SyncQueueListener): () => void {
        this.listeners.add(listener)
        return () => this.listeners.delete(listener)
    }

    private notifyListeners(): void {
        this.listeners.forEach((l) => l())
    }

    public addProject(project: TrackedProjectData, immediateSync = false): void {
        const id = projectId(project)
        this.removeProject(id, true)
        const frequency = project.syncFrequency ?? DEFAULT_SYNC_FREQUENCY_MS
        const nextSyncAt = immediateSync ? Date.now() : Date.now() + frequency
        this.queue.push({ projectId: id, project, nextSyncAt })
        this.sortQueue()
        this.notifyListeners()
        this.scheduleNext()
    }

    public removeProject(id: string, skipSchedule = false): void {
        this.queue = this.queue.filter((e) => e.projectId !== id)
        if (!skipSchedule) {
            this.notifyListeners()
            this.scheduleNext()
        }
    }

    public getNextSyncTime(id: string): number | undefined {
        return this.queue.find((e) => e.projectId === id)?.nextSyncAt
    }

    public getEntries(): readonly SyncQueueEntry[] {
        return this.queue
    }

    public isSyncing(): boolean {
        return this.syncing
    }

    public stop(): void {
        if (this.timerId !== null) {
            clearTimeout(this.timerId)
            this.timerId = null
        }
        this.queue = []
        this.listeners.clear()
    }

    private sortQueue(): void {
        this.queue.sort((a, b) => a.nextSyncAt - b.nextSyncAt)
    }

    private scheduleNext(): void {
        if (this.timerId !== null) {
            clearTimeout(this.timerId)
            this.timerId = null
        }
        if (this.syncing || this.queue.length === 0) return

        const next = this.queue[0]
        const delay = Math.max(0, next.nextSyncAt - Date.now())
        this.timerId = setTimeout(() => this.tick(), delay)
    }

    private async tick(): Promise<void> {
        this.timerId = null
        if (this.queue.length === 0) return

        const entry = this.queue.shift()!
        this.syncing = true
        this.notifyListeners()

        try {
            const freshProjects = this.projectService.loadTrackedProjects()
            const fresh = freshProjects.find((p) => projectId(p) === entry.projectId)
            if (fresh && fresh.enabled && !fresh.excluded) {
                await this.projectService.syncProject(fresh)
            }
        } catch {
            // sync failed — will retry on next cycle
        }

        this.syncing = false

        // Re-read project to get latest syncFrequency
        const freshProjects = this.projectService.loadTrackedProjects()
        const freshProject = freshProjects.find((p) => projectId(p) === entry.projectId)
        if (freshProject && freshProject.enabled && !freshProject.excluded) {
            const frequency = freshProject.syncFrequency ?? DEFAULT_SYNC_FREQUENCY_MS
            this.queue.push({
                projectId: entry.projectId,
                project: freshProject,
                nextSyncAt: Date.now() + frequency,
            })
            this.sortQueue()
        }

        this.notifyListeners()
        this.scheduleNext()
    }
}

