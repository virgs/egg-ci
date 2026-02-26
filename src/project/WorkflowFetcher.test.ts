import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../gateway/CircleCiClient', () => ({
    circleCiClient: {
        listProjectPipelines: vi.fn(),
        listPipelineWorkflows: vi.fn(),
        listWorkflowJobs: vi.fn(),
    },
    initializeCircleCiClient: vi.fn(),
}))

vi.mock('../settings/SettingsRepository', () => ({
    SettingsRepository: vi.fn(),
}))

vi.mock('../time/Time', () => ({
    sleep: vi.fn().mockResolvedValue(undefined),
}))

import { WorkflowFetcher } from './WorkflowFetcher'
import * as CircleCiModule from '../gateway/CircleCiClient'
import { SettingsRepository } from '../settings/SettingsRepository'
import type { ProjectPipeline } from '../gateway/models/ListProjectPipelinesResponse'
import type { PipelineWorkflow } from '../gateway/models/ListPipelineWorkflowsResponse'
import type { WorkflowJob } from '../gateway/models/ListWorkflowJobsResponse'
import type { TrackedProjectData } from '../domain-models/models'

const mockClient = CircleCiModule.circleCiClient as {
    listProjectPipelines: ReturnType<typeof vi.fn>
    listPipelineWorkflows: ReturnType<typeof vi.fn>
    listWorkflowJobs: ReturnType<typeof vi.fn>
}
const MockSettingsRepository = SettingsRepository as unknown as ReturnType<typeof vi.fn>

const testProject: TrackedProjectData = {
    enabled: true,
    vcsType: 'github',
    vcsUrl: 'https://github.com/org/repo',
    reponame: 'repo',
    username: 'org',
    defaultBranch: 'main',
}

function makeConfig(overrides = {}) {
    return {
        jobExecutionsMaxHistory: 5,
        jobHistoryColumnsPerLine: 5,
        autoSyncInterval: 20000,
        minPipelineNumber: 1,
        pipelineWorkflowFetchSleepInMs: 0,
        includeBuildJobs: false,
        ...overrides,
    }
}

function makePipeline(id: string, number: number): ProjectPipeline {
    return {
        id,
        name: 'pipeline',
        errors: [],
        project_slug: 'github/org/repo',
        updated_at: new Date().toISOString(),
        number,
        trigger_parameters: '',
        state: 'created',
        created_at: new Date().toISOString(),
        trigger: {
            type: 'webhook',
            received_at: new Date().toISOString(),
            actor: { login: 'actor', avatar_url: '' },
        },
    }
}

function makePipelineWorkflow(id: string, name: string, pipelineNumber: number): PipelineWorkflow {
    return {
        pipeline_id: 'p1',
        id,
        name,
        project_slug: 'github/org/repo',
        status: 'success',
        started_by: 'actor',
        pipeline_number: pipelineNumber,
        created_at: '2024-01-01T00:00:00Z',
        stopped_at: '2024-01-01T00:01:00Z',
    }
}

function makeWorkflowJob(id: string, name: string, type: 'build' | 'approval', startedAt?: string): WorkflowJob {
    return {
        id,
        name,
        project_slug: 'github/org/repo',
        status: 'success',
        type,
        dependencies: [],
        started_at: startedAt ?? '2024-01-01T00:00:00Z',
    }
}

describe('WorkflowFetcher', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        MockSettingsRepository.mockImplementation(function () {
            return { getConfiguration: vi.fn().mockReturnValue(makeConfig()) }
        })
    })

    // Helper that sets up a single-pipeline scenario.
    // listPipelineWorkflows is called twice: once from listCurrentJobs, once from the main loop.
    // listWorkflowJobs is called twice: once from listCurrentJobs, once from the main loop.
    function setupSinglePipeline(jobs: WorkflowJob[], pipelineNumber = 1) {
        const pipeline = makePipeline('pipe-1', pipelineNumber)
        const workflow = makePipelineWorkflow('wf-1', 'build', pipelineNumber)

        mockClient.listProjectPipelines.mockResolvedValue({
            items: [pipeline],
            next_page_token: '',
        })
        mockClient.listPipelineWorkflows.mockResolvedValue({ items: [workflow], next_page_token: '' })
        mockClient.listWorkflowJobs.mockResolvedValue({ items: jobs, next_page_token: '' })
    }

    describe('insertJob — new workflow created when first seen', () => {
        it('creates a new workflow entry with the job', async () => {
            const job = makeWorkflowJob('job-1', 'deploy', 'approval')
            setupSinglePipeline([job])

            const fetcher = new WorkflowFetcher(testProject)
            const result = await fetcher.getProjectWorkflows()

            expect(result['build']).toBeDefined()
            expect(result['build'].jobs).toHaveLength(1)
            expect(result['build'].jobs[0].name).toBe('deploy')
            expect(result['build'].jobs[0].history).toHaveLength(1)
        })

        it('sets latestBuildNumber and latestId from the workflow', async () => {
            const job = makeWorkflowJob('job-1', 'deploy', 'approval')
            setupSinglePipeline([job], 42)

            const fetcher = new WorkflowFetcher(testProject)
            const result = await fetcher.getProjectWorkflows()

            expect(result['build'].latestBuildNumber).toBe(42)
            expect(result['build'].latestId).toBe('wf-1')
        })
    })

    describe('insertJob — existing job history extended', () => {
        it('extends history when same job seen again in a newer pipeline', async () => {
            const pipe1 = makePipeline('pipe-1', 1)
            const pipe2 = makePipeline('pipe-2', 2)
            const wf1 = makePipelineWorkflow('wf-1', 'build', 1)
            const wf2 = makePipelineWorkflow('wf-2', 'build', 2)
            const job1 = makeWorkflowJob('job-1', 'deploy', 'approval', '2024-01-01T00:00:00Z')
            const job2 = makeWorkflowJob('job-2', 'deploy', 'approval', '2024-01-02T00:00:00Z')

            mockClient.listProjectPipelines.mockResolvedValue({
                items: [pipe1, pipe2],
                next_page_token: '',
            })
            // Call order: listCurrentJobs(pipe-1), main-loop pipe-1, main-loop pipe-2
            mockClient.listPipelineWorkflows
                .mockResolvedValueOnce({ items: [wf1], next_page_token: '' }) // listCurrentJobs
                .mockResolvedValueOnce({ items: [wf1], next_page_token: '' }) // pipe-1 main loop
                .mockResolvedValueOnce({ items: [wf2], next_page_token: '' }) // pipe-2 main loop
            mockClient.listWorkflowJobs
                .mockResolvedValueOnce({ items: [job1], next_page_token: '' }) // listCurrentJobs
                .mockResolvedValueOnce({ items: [job1], next_page_token: '' }) // pipe-1 main loop
                .mockResolvedValueOnce({ items: [job2], next_page_token: '' }) // pipe-2 main loop

            const fetcher = new WorkflowFetcher(testProject)
            const result = await fetcher.getProjectWorkflows()

            expect(result['build'].jobs[0].history).toHaveLength(2)
        })

        it('updates latestBuildNumber only when the pipeline number is newer', async () => {
            const pipe1 = makePipeline('pipe-1', 1)
            const pipe2 = makePipeline('pipe-2', 2)
            const wf1 = makePipelineWorkflow('wf-1', 'build', 1)
            const wf2 = makePipelineWorkflow('wf-2', 'build', 2)
            const job = makeWorkflowJob('job-1', 'deploy', 'approval', '2024-01-01T00:00:00Z')

            mockClient.listProjectPipelines.mockResolvedValue({
                items: [pipe1, pipe2],
                next_page_token: '',
            })
            mockClient.listPipelineWorkflows
                .mockResolvedValueOnce({ items: [wf1], next_page_token: '' })
                .mockResolvedValueOnce({ items: [wf1], next_page_token: '' })
                .mockResolvedValueOnce({ items: [wf2], next_page_token: '' })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [job], next_page_token: '' })

            const fetcher = new WorkflowFetcher(testProject)
            const result = await fetcher.getProjectWorkflows()

            expect(result['build'].latestBuildNumber).toBe(2)
        })
    })

    describe('sortAndFilterJobs', () => {
        it('sorts job history newest-first', async () => {
            const pipe1 = makePipeline('pipe-1', 1)
            const pipe2 = makePipeline('pipe-2', 2)
            const wf1 = makePipelineWorkflow('wf-1', 'build', 1)
            const wf2 = makePipelineWorkflow('wf-2', 'build', 2)
            const olderJob = makeWorkflowJob('job-1', 'deploy', 'approval', '2024-01-01T00:00:00Z')
            const newerJob = makeWorkflowJob('job-2', 'deploy', 'approval', '2024-01-02T00:00:00Z')

            mockClient.listProjectPipelines.mockResolvedValue({
                items: [pipe1, pipe2],
                next_page_token: '',
            })
            mockClient.listPipelineWorkflows
                .mockResolvedValueOnce({ items: [wf1], next_page_token: '' })
                .mockResolvedValueOnce({ items: [wf1], next_page_token: '' })
                .mockResolvedValueOnce({ items: [wf2], next_page_token: '' })
            mockClient.listWorkflowJobs
                .mockResolvedValueOnce({ items: [olderJob], next_page_token: '' })
                .mockResolvedValueOnce({ items: [olderJob], next_page_token: '' })
                .mockResolvedValueOnce({ items: [newerJob], next_page_token: '' })

            const fetcher = new WorkflowFetcher(testProject)
            const result = await fetcher.getProjectWorkflows()

            const history = result['build'].jobs[0].history
            expect(history[0].started_at).toBe('2024-01-02T00:00:00Z')
            expect(history[1].started_at).toBe('2024-01-01T00:00:00Z')
        })

        it('trims history to jobExecutionsMaxHistory', async () => {
            MockSettingsRepository.mockImplementation(function () {
                return { getConfiguration: vi.fn().mockReturnValue(makeConfig({ jobExecutionsMaxHistory: 2 })) }
            })

            // 3 pipelines → 3 history entries, should be trimmed to 2
            const pipes = [makePipeline('p1', 1), makePipeline('p2', 2), makePipeline('p3', 3)]
            const wfs = [
                makePipelineWorkflow('wf-1', 'build', 1),
                makePipelineWorkflow('wf-2', 'build', 2),
                makePipelineWorkflow('wf-3', 'build', 3),
            ]
            const jobs = [
                makeWorkflowJob('j1', 'deploy', 'approval', '2024-01-01T00:00:00Z'),
                makeWorkflowJob('j2', 'deploy', 'approval', '2024-01-02T00:00:00Z'),
                makeWorkflowJob('j3', 'deploy', 'approval', '2024-01-03T00:00:00Z'),
            ]

            mockClient.listProjectPipelines.mockResolvedValue({ items: pipes, next_page_token: '' })
            // 4 calls to listPipelineWorkflows: 1 from listCurrentJobs + 3 from main loop
            mockClient.listPipelineWorkflows
                .mockResolvedValueOnce({ items: [wfs[0]], next_page_token: '' })
                .mockResolvedValueOnce({ items: [wfs[0]], next_page_token: '' })
                .mockResolvedValueOnce({ items: [wfs[1]], next_page_token: '' })
                .mockResolvedValueOnce({ items: [wfs[2]], next_page_token: '' })
            // 4 calls to listWorkflowJobs: 1 from listCurrentJobs + 3 from main loop
            mockClient.listWorkflowJobs
                .mockResolvedValueOnce({ items: [jobs[0]], next_page_token: '' })
                .mockResolvedValueOnce({ items: [jobs[0]], next_page_token: '' })
                .mockResolvedValueOnce({ items: [jobs[1]], next_page_token: '' })
                .mockResolvedValueOnce({ items: [jobs[2]], next_page_token: '' })

            const fetcher = new WorkflowFetcher(testProject)
            const result = await fetcher.getProjectWorkflows()

            expect(result['build'].jobs[0].history).toHaveLength(2)
        })
    })

    describe('listCurrentJobs', () => {
        it('when includeBuildJobs=false, build-type jobs are excluded from results', async () => {
            const buildJob = makeWorkflowJob('j-build', 'ci-build', 'build')
            const approvalJob = makeWorkflowJob('j-approval', 'approve-deploy', 'approval')
            // Both have started_at so main loop won't filter them out
            setupSinglePipeline([buildJob, approvalJob])

            const fetcher = new WorkflowFetcher(testProject)
            const result = await fetcher.getProjectWorkflows()

            const jobNames = result['build']?.jobs.map((j) => j.name) ?? []
            expect(jobNames).not.toContain('ci-build')
            expect(jobNames).toContain('approve-deploy')
        })

        it('when includeBuildJobs=true, both build and approval jobs are included', async () => {
            MockSettingsRepository.mockImplementation(function () {
                return { getConfiguration: vi.fn().mockReturnValue(makeConfig({ includeBuildJobs: true })) }
            })

            const buildJob = makeWorkflowJob('j-build', 'ci-build', 'build')
            const approvalJob = makeWorkflowJob('j-approval', 'approve-deploy', 'approval')
            setupSinglePipeline([buildJob, approvalJob])

            const fetcher = new WorkflowFetcher(testProject)
            const result = await fetcher.getProjectWorkflows()

            const jobNames = result['build']?.jobs.map((j) => j.name) ?? []
            expect(jobNames).toContain('ci-build')
            expect(jobNames).toContain('approve-deploy')
        })
    })
})
