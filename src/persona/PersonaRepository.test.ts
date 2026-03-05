import { beforeEach, describe, expect, it } from 'vitest'
import { PersonaRepository } from './PersonaRepository'

describe('PersonaRepository', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('initializes with a default persona and marks it active', () => {
        const repository = new PersonaRepository()

        expect(repository.getPersonas()).toEqual([
            {
                id: 'default',
                name: 'Default',
                avatar: 'Egg',
            },
        ])
        expect(repository.getActivePersona().id).toBe('default')
    })

    it('creates and activates additional personas', () => {
        const repository = new PersonaRepository()
        const created = repository.addPersona('Deploy Monitor', 'Robot')

        repository.setActivePersona(created.id)

        expect(repository.getActivePersona().id).toBe(created.id)
        expect(repository.getPersonas().some((p) => p.id === created.id)).toBe(true)
    })

    it('does not allow deleting the last remaining persona', () => {
        const repository = new PersonaRepository()

        expect(repository.deletePersona('default')).toBe(false)
        expect(repository.getPersonas()).toHaveLength(1)
    })

    it('deleting a persona removes persona-scoped workflow and project data', () => {
        const repository = new PersonaRepository()
        const created = repository.addPersona('Incident', 'Ninja')

        const trackedKey = repository.scopedKey('trackedProjects', created.id)
        const projectKey = `${repository.scopedKey('project', created.id)}:github/org/repo`
        const filterKey = repository.scopedKey('workflowStatusFilters', created.id)
        localStorage.setItem(trackedKey, JSON.stringify([{ name: 'p' }]))
        localStorage.setItem(projectKey, JSON.stringify({ name: 'projectData' }))
        localStorage.setItem(filterKey, JSON.stringify(['failed']))

        expect(localStorage.getItem(trackedKey)).not.toBeNull()
        expect(localStorage.getItem(projectKey)).not.toBeNull()
        expect(localStorage.getItem(filterKey)).not.toBeNull()

        expect(repository.deletePersona(created.id)).toBe(true)
        expect(localStorage.getItem(trackedKey)).toBeNull()
        expect(localStorage.getItem(projectKey)).toBeNull()
        expect(localStorage.getItem(filterKey)).toBeNull()
    })
})

