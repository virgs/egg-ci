import { describe, it, expect, beforeEach } from 'vitest'
import { DashboardRepository } from './DashboardRepository'
import type { TrackedProjectData } from '../domain-models/models'

function makeProject(reponame: string, overrides?: Partial<TrackedProjectData>): TrackedProjectData {
    return {
        enabled: true,
        vcsType: 'github',
        vcsUrl: `https://github.com/testuser/${reponame}`,
        reponame,
        username: 'testuser',
        defaultBranch: 'main',
        ...overrides,
    }
}

describe('DashboardRepository', () => {
    let repo: DashboardRepository

    beforeEach(() => {
        localStorage.clear()
        repo = new DashboardRepository()
    })

    describe('trackProject', () => {
        it('adds a new project', () => {
            const project = makeProject('my-repo')
            repo.trackProject(project)
            const tracked = repo.loadTrackedProjects()
            expect(tracked).toHaveLength(1)
            expect(tracked[0].reponame).toBe('my-repo')
        })

        it('is idempotent — no duplicates on same vcsType/username/reponame', () => {
            const project = makeProject('my-repo')
            repo.trackProject(project)
            repo.trackProject(project)
            repo.trackProject(project)
            expect(repo.loadTrackedProjects()).toHaveLength(1)
        })

        it('tracks multiple distinct projects', () => {
            repo.trackProject(makeProject('repo-a'))
            repo.trackProject(makeProject('repo-b'))
            expect(repo.loadTrackedProjects()).toHaveLength(2)
        })
    })

    describe('loadTrackedProjects', () => {
        it('returns undefined when empty', () => {
            expect(repo.loadTrackedProjects()).toBeUndefined()
        })
    })

    describe('enableProject', () => {
        it('sets enabled = true for the correct project only', () => {
            const a = makeProject('repo-a', { enabled: false })
            const b = makeProject('repo-b', { enabled: false })
            repo.trackProject(a)
            repo.trackProject(b)
            repo.enableProject(a)
            const tracked = repo.loadTrackedProjects()
            expect(tracked.find((p) => p.reponame === 'repo-a')!.enabled).toBe(true)
            expect(tracked.find((p) => p.reponame === 'repo-b')!.enabled).toBe(false)
        })
    })

    describe('disableProject', () => {
        it('sets enabled = false for the correct project only', () => {
            const a = makeProject('repo-a', { enabled: true })
            const b = makeProject('repo-b', { enabled: true })
            repo.trackProject(a)
            repo.trackProject(b)
            repo.disableProject(a)
            const tracked = repo.loadTrackedProjects()
            expect(tracked.find((p) => p.reponame === 'repo-a')!.enabled).toBe(false)
            expect(tracked.find((p) => p.reponame === 'repo-b')!.enabled).toBe(true)
        })
    })

    describe('persistProject / loadProject', () => {
        it('round-trips a project', () => {
            const project = makeProject('my-repo')
            repo.persistProject(project)
            const loaded = repo.loadProject(project)
            expect(loaded).toEqual(project)
        })

        it('uses the key format project:vcsType/username/reponame', () => {
            const project = makeProject('my-repo')
            repo.persistProject(project)
            const expectedKey = 'project:github/testuser/my-repo'
            const raw = localStorage.getItem(expectedKey)
            expect(raw).not.toBeNull()
            expect(JSON.parse(raw!)).toEqual(project)
        })

        it('returns undefined for missing project', () => {
            const project = makeProject('missing-repo')
            expect(repo.loadProject(project)).toBeUndefined()
        })
    })
})
