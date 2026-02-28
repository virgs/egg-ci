import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../gateway/CircleCiClient', () => ({
    circleCiClient: {
        listProjectPipelines: vi.fn(),
        listPipelineWorkflows: vi.fn(),
        listWorkflowJobs: vi.fn(),
    },
    initializeCircleCiClient: vi.fn(),
}))

import { PipelineFetcher } from './PipelineFetcher'
import * as CircleCiModule from '../gateway/CircleCiClient'
import type { ProjectPipeline } from '../gateway/models/ListProjectPipelinesResponse'
import type { PipelineWorkflow } from '../gateway/models/ListPipelineWorkflowsResponse'
import type { WorkflowJob } from '../gateway/models/ListWorkflowJobsResponse'
import type { TrackedProjectData } from '../domain-models/models'
import type { Config } from '../config'

const mockClient = CircleCiModule.circleCiClient as unknown as {
    listProjectPipelines: ReturnType<typeof vi.fn>
    listPipelineWorkflows: ReturnType<typeof vi.fn>
    listWorkflowJobs: ReturnType<typeof vi.fn>
}

const testProject: TrackedProjectData = {
    enabled: true,
    vcsType: 'github',
    vcsUrl: 'https://github.com/org/repo',
    reponame: 'repo',
    username: 'org',
    defaultBranch: 'main',
}

function makeConfig(minPipelineNumber = 1): Config {
    return {
        jobExecutionsMaxHistory: 5,
        jobHistoryColumnsPerLine: 5,
        autoSyncInterval: 20000,
        minPipelineNumber,
        pipelineWorkflowFetchSleepInMs: 0,
    }
}

function makePipeline(id: string, number: number): ProjectPipeline {
    return {
        id,
        name: 'pipeline',
        errors: [],
        project_slug: 'github/org/repo',
        updated_at: '2024-01-01T00:00:00Z',
        number,
        trigger_parameters: '',
        state: 'created',
        created_at: '2024-01-01T00:00:00Z',
        trigger: {
            type: 'webhook',
            received_at: '2024-01-01T00:00:00Z',
            actor: { login: 'actor', avatar_url: '' },
        },
    }
}

function makePipelineWorkflow(id: string, name: string): PipelineWorkflow {
    return {
        id,
        name,
        pipeline_id: 'p1',
        project_slug: 'github/org/repo',
        status: 'success',
        started_by: 'actor',
        pipeline_number: 1,
        created_at: '2024-01-01T00:00:00Z',
        stopped_at: '2024-01-01T00:01:00Z',
    }
}

function makeWorkflowJob(id: string, name: string, type: 'build' | 'approval'): WorkflowJob {
    return {
        id,
        name,
        project_slug: 'github/org/repo',
        status: 'success',
        type,
        dependencies: [],
        started_at: '2024-01-01T00:00:00Z',
    }
}

describe('PipelineFetcher', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('listProjectPipelines', () => {
        it('returns pipelines from the first page when minPipelineNumber is satisfied', async () => {
            const pipeline = makePipeline('pipe-1', 1)
            mockClient.listProjectPipelines.mockResolvedValue({ items: [pipeline], next_page_token: '' })

            const result = await new PipelineFetcher(testProject, makeConfig(1)).listProjectPipelines()

            expect(result).toHaveLength(1)
            expect(result[0].id).toBe('pipe-1')
            expect(mockClient.listProjectPipelines).toHaveBeenCalledTimes(1)
            expect(mockClient.listProjectPipelines).toHaveBeenCalledWith(testProject, 'main', undefined)
        })

        it('fetches additional pages until minPipelineNumber is satisfied', async () => {
            const pipe1 = makePipeline('pipe-1', 1)
            const pipe2 = makePipeline('pipe-2', 2)
            mockClient.listProjectPipelines
                .mockResolvedValueOnce({ items: [pipe1], next_page_token: 'page2' })
                .mockResolvedValueOnce({ items: [pipe2], next_page_token: '' })

            const result = await new PipelineFetcher(testProject, makeConfig(2)).listProjectPipelines()

            expect(result).toHaveLength(2)
            expect(mockClient.listProjectPipelines).toHaveBeenCalledTimes(2)
            expect(mockClient.listProjectPipelines).toHaveBeenNthCalledWith(2, testProject, 'main', 'page2')
        })

        it('stops fetching when next_page_token is absent even if below minPipelineNumber', async () => {
            const pipeline = makePipeline('pipe-1', 1)
            mockClient.listProjectPipelines.mockResolvedValue({ items: [pipeline], next_page_token: '' })

            const result = await new PipelineFetcher(testProject, makeConfig(10)).listProjectPipelines()

            expect(result).toHaveLength(1)
            expect(mockClient.listProjectPipelines).toHaveBeenCalledTimes(1)
        })

        it('accumulates pipelines across multiple pages', async () => {
            const pipes = [makePipeline('p1', 1), makePipeline('p2', 2), makePipeline('p3', 3)]
            mockClient.listProjectPipelines
                .mockResolvedValueOnce({ items: [pipes[0], pipes[1]], next_page_token: 'page2' })
                .mockResolvedValueOnce({ items: [pipes[2]], next_page_token: '' })

            const result = await new PipelineFetcher(testProject, makeConfig(3)).listProjectPipelines()

            expect(result).toHaveLength(3)
            expect(result.map((p) => p.id)).toEqual(['p1', 'p2', 'p3'])
        })

        it('uses the project defaultBranch when querying', async () => {
            const branchProject = { ...testProject, defaultBranch: 'develop' }
            mockClient.listProjectPipelines.mockResolvedValue({ items: [], next_page_token: '' })

            await new PipelineFetcher(branchProject, makeConfig()).listProjectPipelines()

            expect(mockClient.listProjectPipelines).toHaveBeenCalledWith(branchProject, 'develop', undefined)
        })
    })

    describe('listCurrentJobs', () => {
        it('returns unique job names from the pipeline workflows', async () => {
            const pipeline = makePipeline('pipe-1', 1)
            const workflow = makePipelineWorkflow('wf-1', 'build')
            const job1 = makeWorkflowJob('j1', 'test', 'build')
            const job2 = makeWorkflowJob('j2', 'deploy', 'approval')

            mockClient.listPipelineWorkflows.mockResolvedValue({ items: [workflow], next_page_token: '' })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [job1, job2], next_page_token: '' })

            const result = await new PipelineFetcher(testProject, makeConfig()).listCurrentJobs([pipeline])

            expect(result).toContain('test')
            expect(result).toContain('deploy')
        })

        it('uses only the first (most recent) pipeline for job detection', async () => {
            const pipe1 = makePipeline('pipe-1', 2)
            const pipe2 = makePipeline('pipe-2', 1)
            const workflow = makePipelineWorkflow('wf-1', 'build')
            const job = makeWorkflowJob('j1', 'test', 'build')

            mockClient.listPipelineWorkflows.mockResolvedValue({ items: [workflow], next_page_token: '' })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [job], next_page_token: '' })

            await new PipelineFetcher(testProject, makeConfig()).listCurrentJobs([pipe1, pipe2])

            expect(mockClient.listPipelineWorkflows).toHaveBeenCalledTimes(1)
            expect(mockClient.listPipelineWorkflows).toHaveBeenCalledWith('pipe-1')
        })

        it('filters out the "setup" workflow', async () => {
            const pipeline = makePipeline('pipe-1', 1)
            const setupWorkflow = makePipelineWorkflow('wf-setup', 'setup')
            const ciWorkflow = makePipelineWorkflow('wf-ci', 'ci')
            const ciJob = makeWorkflowJob('j2', 'ci-job', 'build')

            mockClient.listPipelineWorkflows.mockResolvedValue({
                items: [setupWorkflow, ciWorkflow],
                next_page_token: '',
            })
            // setup workflow is filtered before listWorkflowJobs is called — only ci workflow triggers a call
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [ciJob], next_page_token: '' })

            const result = await new PipelineFetcher(testProject, makeConfig()).listCurrentJobs([pipeline])

            expect(result).not.toContain('setup-job')
            expect(result).toContain('ci-job')
            expect(mockClient.listWorkflowJobs).toHaveBeenCalledTimes(1)
            expect(mockClient.listWorkflowJobs).toHaveBeenCalledWith('wf-ci')
        })

        it('filters out workflows with empty id', async () => {
            const pipeline = makePipeline('pipe-1', 1)
            const emptyIdWorkflow = { ...makePipelineWorkflow('', 'ci') }
            const validWorkflow = makePipelineWorkflow('wf-valid', 'build')
            const job = makeWorkflowJob('j1', 'test', 'build')

            mockClient.listPipelineWorkflows.mockResolvedValue({
                items: [emptyIdWorkflow, validWorkflow],
                next_page_token: '',
            })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [job], next_page_token: '' })

            await new PipelineFetcher(testProject, makeConfig()).listCurrentJobs([pipeline])

            expect(mockClient.listWorkflowJobs).toHaveBeenCalledTimes(1)
            expect(mockClient.listWorkflowJobs).toHaveBeenCalledWith('wf-valid')
        })

        it('deduplicates job names across multiple workflows', async () => {
            const pipeline = makePipeline('pipe-1', 1)
            const wf1 = makePipelineWorkflow('wf-1', 'build')
            const wf2 = makePipelineWorkflow('wf-2', 'test')
            const sharedJob = makeWorkflowJob('j1', 'shared', 'build')

            mockClient.listPipelineWorkflows.mockResolvedValue({ items: [wf1, wf2], next_page_token: '' })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [sharedJob], next_page_token: '' })

            const result = await new PipelineFetcher(testProject, makeConfig()).listCurrentJobs([pipeline])

            expect(result.filter((name) => name === 'shared')).toHaveLength(1)
        })

        it('when includeBuildJobs is false, excludes build-type jobs', async () => {
            const pipeline = makePipeline('pipe-1', 1)
            const workflow = makePipelineWorkflow('wf-1', 'build')
            const buildJob = makeWorkflowJob('j1', 'ci-build', 'build')
            const approvalJob = makeWorkflowJob('j2', 'approve', 'approval')

            mockClient.listPipelineWorkflows.mockResolvedValue({ items: [workflow], next_page_token: '' })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [buildJob, approvalJob], next_page_token: '' })

            const result = await new PipelineFetcher(
                { ...testProject, includeBuildJobs: false },
                makeConfig()
            ).listCurrentJobs([pipeline])

            expect(result).not.toContain('ci-build')
            expect(result).toContain('approve')
        })

        it('when includeBuildJobs is true, includes both build and approval jobs', async () => {
            const pipeline = makePipeline('pipe-1', 1)
            const workflow = makePipelineWorkflow('wf-1', 'build')
            const buildJob = makeWorkflowJob('j1', 'ci-build', 'build')
            const approvalJob = makeWorkflowJob('j2', 'approve', 'approval')

            mockClient.listPipelineWorkflows.mockResolvedValue({ items: [workflow], next_page_token: '' })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [buildJob, approvalJob], next_page_token: '' })

            const result = await new PipelineFetcher(
                { ...testProject, includeBuildJobs: true },
                makeConfig()
            ).listCurrentJobs([pipeline])

            expect(result).toContain('ci-build')
            expect(result).toContain('approve')
        })

        it('when includeBuildJobs is unset, defaults to true and includes build jobs', async () => {
            const pipeline = makePipeline('pipe-1', 1)
            const workflow = makePipelineWorkflow('wf-1', 'build')
            const buildJob = makeWorkflowJob('j1', 'ci-build', 'build')

            mockClient.listPipelineWorkflows.mockResolvedValue({ items: [workflow], next_page_token: '' })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [buildJob], next_page_token: '' })

            const result = await new PipelineFetcher(testProject, makeConfig()).listCurrentJobs([pipeline])

            expect(result).toContain('ci-build')
        })
    })
})
