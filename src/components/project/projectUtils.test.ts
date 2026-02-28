import { describe, it, expect } from 'vitest'
import { collectUniqueJobs } from './projectUtils'
import type { ProjectData } from '../../domain-models/models'

function makeProjectData(workflows: ProjectData['workflows']): ProjectData {
    return {
        vcsType: 'github',
        reponame: 'repo',
        username: 'org',
        vcsUrl: 'https://github.com/org/repo',
        ciUrl: 'https://app.circleci.com/pipelines/github/org/repo',
        defaultBranch: 'main',
        lastSyncedAt: '2024-01-01T00:00:00Z',
        workflows,
    }
}

function makeJobContext(name: string, type: 'build' | 'approval') {
    return {
        name,
        history: [
            {
                id: `job-${name}`,
                name,
                project_slug: 'github/org/repo',
                status: 'success' as const,
                type,
                dependencies: [],
                started_at: '2024-01-01T00:00:00Z',
                workflow: { id: 'wf-1', pipeline_id: 'p1', pipeline_number: 1 },
                pipeline: {
                    updated_at: '2024-01-01T00:00:00Z',
                    trigger: { actor: { login: 'actor', avatar_url: '' } },
                },
            },
        ],
    }
}

describe('collectUniqueJobs', () => {
    it('returns an empty array when there are no workflows', () => {
        const project = makeProjectData({})
        expect(collectUniqueJobs(project)).toEqual([])
    })

    it('returns all jobs from a single workflow', () => {
        const project = makeProjectData({
            build: {
                name: 'build',
                latestBuildNumber: 1,
                latestId: 'wf-1',
                jobs: [makeJobContext('test', 'build'), makeJobContext('deploy', 'approval')],
            },
        })

        const result = collectUniqueJobs(project)

        expect(result).toHaveLength(2)
        expect(result.find((j) => j.name === 'test')?.type).toBe('build')
        expect(result.find((j) => j.name === 'deploy')?.type).toBe('approval')
    })

    it('collects jobs from multiple workflows', () => {
        const project = makeProjectData({
            build: {
                name: 'build',
                latestBuildNumber: 1,
                latestId: 'wf-1',
                jobs: [makeJobContext('lint', 'build')],
            },
            deploy: {
                name: 'deploy',
                latestBuildNumber: 1,
                latestId: 'wf-2',
                jobs: [makeJobContext('release', 'approval')],
            },
        })

        const result = collectUniqueJobs(project)

        expect(result).toHaveLength(2)
        expect(result.map((j) => j.name)).toContain('lint')
        expect(result.map((j) => j.name)).toContain('release')
    })

    it('deduplicates jobs with the same name across workflows', () => {
        const project = makeProjectData({
            wf1: {
                name: 'wf1',
                latestBuildNumber: 1,
                latestId: 'wf-1',
                jobs: [makeJobContext('shared-job', 'build')],
            },
            wf2: {
                name: 'wf2',
                latestBuildNumber: 1,
                latestId: 'wf-2',
                jobs: [makeJobContext('shared-job', 'build')],
            },
        })

        const result = collectUniqueJobs(project)

        expect(result.filter((j) => j.name === 'shared-job')).toHaveLength(1)
    })

    it('preserves the type from the first occurrence when deduplicating', () => {
        const project = makeProjectData({
            wf1: {
                name: 'wf1',
                latestBuildNumber: 1,
                latestId: 'wf-1',
                jobs: [makeJobContext('shared-job', 'approval')],
            },
            wf2: {
                name: 'wf2',
                latestBuildNumber: 1,
                latestId: 'wf-2',
                jobs: [makeJobContext('shared-job', 'build')],
            },
        })

        const result = collectUniqueJobs(project)

        expect(result.find((j) => j.name === 'shared-job')?.type).toBe('approval')
    })

    it('falls back to "build" when a job has no history entries', () => {
        const project = makeProjectData({
            build: {
                name: 'build',
                latestBuildNumber: 1,
                latestId: 'wf-1',
                jobs: [{ name: 'no-history-job', history: [] }],
            },
        })

        const result = collectUniqueJobs(project)

        expect(result).toHaveLength(1)
        expect(result[0].type).toBe('build')
    })
})
