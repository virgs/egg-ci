import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { SyncQueue } from './SyncQueue'
import { ProjectService } from './ProjectService'
import { DEFAULT_SYNC_FREQUENCY_MS, TrackedProjectData } from '../domain-models/models'

vi.mock('./ProjectRepository')
vi.mock('../gateway/CircleCiClient', () => ({
    circleCiClient: {},
    initializeCircleCiClient: vi.fn(),
}))

function makeProject(name: string, overrides: Partial<TrackedProjectData> = {}): TrackedProjectData {
    return {
        enabled: true,
        vcsType: 'github',
        vcsUrl: `https://github.com/org/${name}`,
        reponame: name,
        username: 'org',
        defaultBranch: 'main',
        ...overrides,
    }
}

describe('SyncQueue', () => {
    let syncQueue: SyncQueue
    let projectService: ProjectService

    beforeEach(() => {
        vi.useFakeTimers()
        projectService = new ProjectService()
        vi.spyOn(projectService, 'syncProject').mockResolvedValue({
            vcsType: 'github',
            vcsUrl: '',
            reponame: '',
            username: '',
            defaultBranch: '',
            ciUrl: '',
            workflows: {},
        })
        vi.spyOn(projectService, 'loadTrackedProjects').mockReturnValue([])
        syncQueue = new SyncQueue(projectService)
    })

    afterEach(() => {
        syncQueue.stop()
        vi.useRealTimers()
    })

    describe('addProject', () => {
        it('schedules a project with default frequency when no syncFrequency set', () => {
            const project = makeProject('repo-a')
            syncQueue.addProject(project)

            const nextSync = syncQueue.getNextSyncTime('github/org/repo-a')
            expect(nextSync).toBeDefined()
            expect(nextSync! - Date.now()).toBeGreaterThan(0)
            expect(nextSync! - Date.now()).toBeLessThanOrEqual(DEFAULT_SYNC_FREQUENCY_MS)
        })

        it('schedules a project with custom frequency', () => {
            const project = makeProject('repo-b', { syncFrequency: 60_000 })
            syncQueue.addProject(project)

            const nextSync = syncQueue.getNextSyncTime('github/org/repo-b')
            expect(nextSync).toBeDefined()
            expect(nextSync! - Date.now()).toBeLessThanOrEqual(60_000)
        })

        it('schedules immediate sync when immediateSync=true', () => {
            const project = makeProject('repo-c')
            syncQueue.addProject(project, true)

            const nextSync = syncQueue.getNextSyncTime('github/org/repo-c')
            expect(nextSync).toBeDefined()
            expect(nextSync! - Date.now()).toBeLessThanOrEqual(0)
        })

        it('replaces existing entry when adding same project again', () => {
            const project = makeProject('repo-d')
            syncQueue.addProject(project)
            syncQueue.addProject(project)

            const entries = syncQueue.getEntries()
            const matching = entries.filter((e) => e.projectId === 'github/org/repo-d')
            expect(matching).toHaveLength(1)
        })
    })

    describe('removeProject', () => {
        it('removes a project from the queue', () => {
            const project = makeProject('repo-e')
            syncQueue.addProject(project)
            expect(syncQueue.getNextSyncTime('github/org/repo-e')).toBeDefined()

            syncQueue.removeProject('github/org/repo-e')
            expect(syncQueue.getNextSyncTime('github/org/repo-e')).toBeUndefined()
        })
    })

    describe('queue ordering', () => {
        it('sorts queue by nextSyncAt ascending', () => {
            const projectA = makeProject('repo-a', { syncFrequency: 60_000 })
            const projectB = makeProject('repo-b', { syncFrequency: 10_000 })

            syncQueue.addProject(projectA)
            syncQueue.addProject(projectB)

            const entries = syncQueue.getEntries()
            expect(entries[0].projectId).toBe('github/org/repo-b')
            expect(entries[1].projectId).toBe('github/org/repo-a')
        })
    })

    describe('tick — sync execution', () => {
        it('syncs the project when timer fires', async () => {
            const project = makeProject('repo-f', { syncFrequency: 5_000 })
            vi.spyOn(projectService, 'loadTrackedProjects').mockReturnValue([project])
            syncQueue.addProject(project, true)

            await vi.advanceTimersByTimeAsync(0)

            expect(projectService.syncProject).toHaveBeenCalledWith(project)
        })

        it('re-enqueues the project after sync completes', async () => {
            const project = makeProject('repo-g', { syncFrequency: 5_000 })
            vi.spyOn(projectService, 'loadTrackedProjects').mockReturnValue([project])
            syncQueue.addProject(project, true)

            await vi.advanceTimersByTimeAsync(0)

            const nextSync = syncQueue.getNextSyncTime('github/org/repo-g')
            expect(nextSync).toBeDefined()
            expect(nextSync! - Date.now()).toBeLessThanOrEqual(5_000)
        })

        it('does not re-enqueue disabled projects', async () => {
            const project = makeProject('repo-h', { syncFrequency: 5_000 })
            vi.spyOn(projectService, 'loadTrackedProjects').mockReturnValue([
                { ...project, enabled: false },
            ])
            syncQueue.addProject(project, true)

            await vi.advanceTimersByTimeAsync(0)

            expect(syncQueue.getNextSyncTime('github/org/repo-h')).toBeUndefined()
        })

        it('does not re-enqueue excluded projects', async () => {
            const project = makeProject('repo-i', { syncFrequency: 5_000 })
            vi.spyOn(projectService, 'loadTrackedProjects').mockReturnValue([
                { ...project, excluded: true },
            ])
            syncQueue.addProject(project, true)

            await vi.advanceTimersByTimeAsync(0)

            expect(syncQueue.getNextSyncTime('github/org/repo-i')).toBeUndefined()
        })

        it('reschedules based on completion time, not original schedule', async () => {
            const project = makeProject('repo-j', { syncFrequency: 10_000 })
            vi.spyOn(projectService, 'loadTrackedProjects').mockReturnValue([project])
            vi.spyOn(projectService, 'syncProject').mockImplementation(async () => {
                await new Promise((r) => setTimeout(r, 3_000))
                return { vcsType: '', vcsUrl: '', reponame: '', username: '', defaultBranch: '', ciUrl: '', workflows: {} }
            })
            syncQueue.addProject(project, true)

            await vi.advanceTimersByTimeAsync(0) // trigger tick
            await vi.advanceTimersByTimeAsync(3_000) // complete sync

            const nextSync = syncQueue.getNextSyncTime('github/org/repo-j')
            expect(nextSync).toBeDefined()
            // Next sync should be ~10s from completion (now + 10_000), not from original schedule
            expect(nextSync! - Date.now()).toBeLessThanOrEqual(10_000)
            expect(nextSync! - Date.now()).toBeGreaterThan(0)
        })
    })

    describe('sequential processing', () => {
        it('syncs projects one at a time, not in parallel', async () => {
            let concurrentSyncs = 0
            let maxConcurrentSyncs = 0

            vi.spyOn(projectService, 'syncProject').mockImplementation(async () => {
                concurrentSyncs++
                maxConcurrentSyncs = Math.max(maxConcurrentSyncs, concurrentSyncs)
                await new Promise((r) => setTimeout(r, 100))
                concurrentSyncs--
                return { vcsType: '', vcsUrl: '', reponame: '', username: '', defaultBranch: '', ciUrl: '', workflows: {} }
            })

            const projectA = makeProject('repo-k', { syncFrequency: 60_000 })
            const projectB = makeProject('repo-l', { syncFrequency: 60_000 })
            vi.spyOn(projectService, 'loadTrackedProjects').mockReturnValue([projectA, projectB])

            syncQueue.addProject(projectA, true)
            syncQueue.addProject(projectB, true)

            await vi.advanceTimersByTimeAsync(0)
            await vi.advanceTimersByTimeAsync(100)
            await vi.advanceTimersByTimeAsync(0)
            await vi.advanceTimersByTimeAsync(100)

            expect(maxConcurrentSyncs).toBe(1)
        })
    })

    describe('subscribe', () => {
        it('notifies listeners when queue changes', async () => {
            const listener = vi.fn()
            syncQueue.subscribe(listener)

            const project = makeProject('repo-m')
            syncQueue.addProject(project)

            expect(listener).toHaveBeenCalled()
        })

        it('unsubscribe stops notifications', () => {
            const listener = vi.fn()
            const unsubscribe = syncQueue.subscribe(listener)
            unsubscribe()

            syncQueue.addProject(makeProject('repo-n'))
            expect(listener).not.toHaveBeenCalled()
        })
    })

    describe('stop', () => {
        it('clears the queue and prevents further syncs', async () => {
            const project = makeProject('repo-o', { syncFrequency: 1_000 })
            syncQueue.addProject(project)

            syncQueue.stop()

            expect(syncQueue.getEntries()).toHaveLength(0)
            await vi.advanceTimersByTimeAsync(5_000)
            expect(projectService.syncProject).not.toHaveBeenCalled()
        })
    })

    describe('error handling', () => {
        it('re-enqueues the project even if sync fails', async () => {
            const project = makeProject('repo-p', { syncFrequency: 5_000 })
            vi.spyOn(projectService, 'loadTrackedProjects').mockReturnValue([project])
            vi.spyOn(projectService, 'syncProject').mockRejectedValue(new Error('API error'))
            syncQueue.addProject(project, true)

            await vi.advanceTimersByTimeAsync(0)

            const nextSync = syncQueue.getNextSyncTime('github/org/repo-p')
            expect(nextSync).toBeDefined()
        })
    })
})

