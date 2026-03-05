import { beforeEach, describe, expect, it } from 'vitest'
import { ProfileRepository } from './ProfileRepository'

describe('ProfileRepository', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('initializes with a default profile and marks it active', () => {
        const repository = new ProfileRepository()

        expect(repository.getProfiles()).toEqual([
            {
                id: 'default',
                name: 'Default',
            },
        ])
        expect(repository.getActiveProfile().id).toBe('default')
    })

    it('creates and activates additional profiles with unique names', () => {
        const repository = new ProfileRepository()
        const created = repository.addProfile('Deploy Monitor')

        repository.setActiveProfile(created.id)

        expect(repository.getActiveProfile().id).toBe(created.id)
        expect(repository.getProfiles().some((p) => p.id === created.id)).toBe(true)
    })

    it('rejects duplicate profile names (case-insensitive)', () => {
        const repository = new ProfileRepository()
        repository.addProfile('Production')

        expect(() => repository.addProfile('production')).toThrow('Profile name already exists')
    })

    it('does not allow deleting the last remaining profile', () => {
        const repository = new ProfileRepository()

        expect(repository.deleteProfile('default')).toBe(false)
        expect(repository.getProfiles()).toHaveLength(1)
    })

    it('deleting a profile removes profile-scoped workflow and project data', () => {
        const repository = new ProfileRepository()
        const created = repository.addProfile('Incident')

        const trackedKey = repository.scopedKey('trackedProjects', created.id)
        const projectKey = `${repository.scopedKey('project', created.id)}:github/org/repo`
        const filterKey = repository.scopedKey('workflowStatusFilters', created.id)
        localStorage.setItem(trackedKey, JSON.stringify([{ name: 'p' }]))
        localStorage.setItem(projectKey, JSON.stringify({ name: 'projectData' }))
        localStorage.setItem(filterKey, JSON.stringify(['failed']))

        expect(localStorage.getItem(trackedKey)).not.toBeNull()
        expect(localStorage.getItem(projectKey)).not.toBeNull()
        expect(localStorage.getItem(filterKey)).not.toBeNull()

        expect(repository.deleteProfile(created.id)).toBe(true)
        expect(localStorage.getItem(trackedKey)).toBeNull()
        expect(localStorage.getItem(projectKey)).toBeNull()
        expect(localStorage.getItem(filterKey)).toBeNull()
    })

    it('getNextProfileName returns lowest available number', () => {
        const repository = new ProfileRepository()
        repository.addProfile('Egg profile (1)')
        repository.addProfile('Egg profile (2)')

        expect(repository.getNextProfileName()).toBe('Egg profile (3)')
    })

    it('getNextProfileName reuses lowest available when gap exists', () => {
        const repository = new ProfileRepository()
        const p1 = repository.addProfile('Egg profile (1)')
        repository.addProfile('Egg profile (2)')
        repository.deleteProfile(p1.id)

        expect(repository.getNextProfileName()).toBe('Egg profile (1)')
    })
})

