import { describe, expect, it } from 'vitest'
import { TrackedProjectData } from '../domain-models/models'
import { hasEnabledProjects } from './workflowsPageUtils'

const makeProject = (overrides?: Partial<TrackedProjectData>): TrackedProjectData => ({
    enabled: false,
    vcsType: 'github',
    vcsUrl: 'https://github.com/test/repo',
    reponame: 'repo',
    username: 'test',
    defaultBranch: 'main',
    ...overrides,
})

describe('hasEnabledProjects', () => {
    it('returns false when all projects are disabled', () => {
        const projects = [makeProject({ enabled: false }), makeProject({ enabled: false, reponame: 'repo-2' })]
        expect(hasEnabledProjects(projects)).toBe(false)
    })

    it('returns false when enabled projects are excluded', () => {
        const projects = [makeProject({ enabled: true, excluded: true })]
        expect(hasEnabledProjects(projects)).toBe(false)
    })

    it('returns true when at least one project is enabled and not excluded', () => {
        const projects = [
            makeProject({ enabled: false }),
            makeProject({ enabled: true, excluded: false, reponame: 'repo-2' }),
        ]
        expect(hasEnabledProjects(projects)).toBe(true)
    })
})
