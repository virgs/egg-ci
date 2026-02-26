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

const mockClient = CircleCiModule.circleCiClient as unknown as {
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

    describe('setup workflow filtering', () => {
        it('skips workflows named "setup"', async () => {
            const pipeline = makePipeline('pipe-1', 1)
            const setupWorkflow = makePipelineWorkflow('wf-setup', 'setup', 1)
            const ciWorkflow = makePipelineWorkflow('wf-ci', 'ci', 1)
            const job = makeWorkflowJob('j1', 'test', 'approval')

            mockClient.listProjectPipelines.mockResolvedValue({ items: [pipeline], next_page_token: '' })
            mockClient.listPipelineWorkflows.mockResolvedValue({
                items: [setupWorkflow, ciWorkflow],
                next_page_token: '',
            })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [job], next_page_token: '' })

            const result = await new WorkflowFetcher(testProject).getProjectWorkflows()

            expect(result['setup']).toBeUndefined()
            expect(result['ci']).toBeDefined()
            expect(result['ci'].jobs[0].name).toBe('test')
        })
    })

    describe('started_at filtering', () => {
        it('excludes jobs that have no started_at from history', async () => {
            const started = makeWorkflowJob('j1', 'deploy', 'approval')
            const unstarted: typeof started = { ...makeWorkflowJob('j2', 'pending', 'approval'), started_at: undefined }
            setupSinglePipeline([started, unstarted])

            const result = await new WorkflowFetcher(testProject).getProjectWorkflows()

            const jobNames = result['build']?.jobs.map((j) => j.name) ?? []
            expect(jobNames).toContain('deploy')
            expect(jobNames).not.toContain('pending')
        })
    })

    describe('currentJobs filtering', () => {
        it('excludes jobs whose names do not appear in the most recent pipeline', async () => {
            const pipe1 = makePipeline('pipe-1', 2)
            const pipe2 = makePipeline('pipe-2', 1)
            const wf1 = makePipelineWorkflow('wf-1', 'build', 2)
            const wf2 = makePipelineWorkflow('wf-2', 'build', 1)
            const currentJob = makeWorkflowJob('j1', 'current-job', 'approval')
            const obsoleteJob = makeWorkflowJob('j2', 'obsolete-job', 'approval')

            mockClient.listProjectPipelines.mockResolvedValue({ items: [pipe1, pipe2], next_page_token: '' })
            mockClient.listPipelineWorkflows
                .mockResolvedValueOnce({ items: [wf1], next_page_token: '' }) // listCurrentJobs uses pipe-1
                .mockResolvedValueOnce({ items: [wf1], next_page_token: '' }) // main loop pipe-1
                .mockResolvedValueOnce({ items: [wf2], next_page_token: '' }) // main loop pipe-2
            mockClient.listWorkflowJobs
                .mockResolvedValueOnce({ items: [currentJob], next_page_token: '' }) // listCurrentJobs
                .mockResolvedValueOnce({ items: [currentJob], next_page_token: '' }) // main loop pipe-1
                .mockResolvedValueOnce({ items: [obsoleteJob], next_page_token: '' }) // main loop pipe-2

            const result = await new WorkflowFetcher(testProject).getProjectWorkflows()

            const jobNames = result['build']?.jobs.map((j) => j.name) ?? []
            expect(jobNames).toContain('current-job')
            expect(jobNames).not.toContain('obsolete-job')
        })
    })

    describe('pipeline pagination', () => {
        it('fetches additional pages until minPipelineNumber is satisfied', async () => {
            MockSettingsRepository.mockImplementation(function () {
                return { getConfiguration: vi.fn().mockReturnValue(makeConfig({ minPipelineNumber: 2 })) }
            })

            const pipe1 = makePipeline('pipe-1', 1)
            const pipe2 = makePipeline('pipe-2', 2)
            const wf = makePipelineWorkflow('wf-1', 'build', 1)
            const job = makeWorkflowJob('j1', 'deploy', 'approval')

            mockClient.listProjectPipelines
                .mockResolvedValueOnce({ items: [pipe1], next_page_token: 'page2' })
                .mockResolvedValueOnce({ items: [pipe2], next_page_token: '' })
            mockClient.listPipelineWorkflows.mockResolvedValue({ items: [wf], next_page_token: '' })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [job], next_page_token: '' })

            await new WorkflowFetcher(testProject).getProjectWorkflows()

            expect(mockClient.listProjectPipelines).toHaveBeenCalledTimes(2)
        })

        it('stops fetching pages when next_page_token is absent even if below minPipelineNumber', async () => {
            MockSettingsRepository.mockImplementation(function () {
                return { getConfiguration: vi.fn().mockReturnValue(makeConfig({ minPipelineNumber: 10 })) }
            })

            const pipe1 = makePipeline('pipe-1', 1)
            const wf = makePipelineWorkflow('wf-1', 'build', 1)
            const job = makeWorkflowJob('j1', 'deploy', 'approval')

            mockClient.listProjectPipelines.mockResolvedValue({ items: [pipe1], next_page_token: '' })
            mockClient.listPipelineWorkflows.mockResolvedValue({ items: [wf], next_page_token: '' })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [job], next_page_token: '' })

            await new WorkflowFetcher(testProject).getProjectWorkflows()

            expect(mockClient.listProjectPipelines).toHaveBeenCalledTimes(1)
        })
    })

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

    describe('incremental sync', () => {
        const FIXED_DATE = '2024-01-01T00:00:00Z'
        const UPDATED_DATE = '2024-01-02T00:00:00Z'

        function makeExistingWorkflows(pipelineNumber: number, updatedAt: string) {
            return {
                build: {
                    name: 'build',
                    latestBuildNumber: pipelineNumber,
                    latestId: 'wf-existing',
                    jobs: [
                        {
                            name: 'deploy',
                            history: [
                                {
                                    id: 'job-existing',
                                    name: 'deploy',
                                    project_slug: 'github/org/repo',
                                    status: 'success' as const,
                                    type: 'approval' as const,
                                    dependencies: [],
                                    started_at: FIXED_DATE,
                                    workflow: { id: 'wf-existing', pipeline_id: 'p1', pipeline_number: pipelineNumber },
                                    pipeline: {
                                        updated_at: updatedAt,
                                        trigger: { actor: { login: 'actor', avatar_url: '' } },
                                    },
                                },
                            ],
                        },
                    ],
                },
            }
        }

        it('unchanged pipeline is skipped — listWorkflowJobs not called in main loop', async () => {
            const existingWorkflows = makeExistingWorkflows(1, FIXED_DATE)
            const pipeline = { ...makePipeline('pipe-1', 1), updated_at: FIXED_DATE }
            const wf = makePipelineWorkflow('wf-1', 'build', 1)
            const job = makeWorkflowJob('j1', 'deploy', 'approval')

            mockClient.listProjectPipelines.mockResolvedValue({ items: [pipeline], next_page_token: '' })
            mockClient.listPipelineWorkflows.mockResolvedValue({ items: [wf], next_page_token: '' })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [job], next_page_token: '' })

            const result = await new WorkflowFetcher(testProject, existingWorkflows).getProjectWorkflows()

            // Only called once (from listCurrentJobs), not again in the main loop
            expect(mockClient.listWorkflowJobs).toHaveBeenCalledTimes(1)
            // Existing data preserved
            expect(result['build'].jobs[0].history[0].id).toBe('job-existing')
        })

        it('changed pipeline replaces stale entries with fresh data', async () => {
            const existingWorkflows = makeExistingWorkflows(1, FIXED_DATE)
            const pipeline = { ...makePipeline('pipe-1', 1), updated_at: UPDATED_DATE }
            const wf = makePipelineWorkflow('wf-1', 'build', 1)
            const freshJob = makeWorkflowJob('job-fresh', 'deploy', 'approval', UPDATED_DATE)

            mockClient.listProjectPipelines.mockResolvedValue({ items: [pipeline], next_page_token: '' })
            mockClient.listPipelineWorkflows.mockResolvedValue({ items: [wf], next_page_token: '' })
            mockClient.listWorkflowJobs.mockResolvedValue({ items: [freshJob], next_page_token: '' })

            const result = await new WorkflowFetcher(testProject, existingWorkflows).getProjectWorkflows()

            const history = result['build'].jobs[0].history
            expect(history).toHaveLength(1) // stale entry removed, fresh entry added
            expect(history[0].id).toBe('job-fresh')
        })

        it('new pipeline added while unchanged existing pipeline data is preserved', async () => {
            const existingWorkflows = makeExistingWorkflows(1, FIXED_DATE)
            const pipe2 = makePipeline('pipe-2', 2) // new pipeline
            const pipe1 = { ...makePipeline('pipe-1', 1), updated_at: FIXED_DATE } // existing, unchanged
            const wf2 = makePipelineWorkflow('wf-2', 'build', 2)
            const newJob = makeWorkflowJob('job-new', 'deploy', 'approval', UPDATED_DATE)

            mockClient.listProjectPipelines.mockResolvedValue({ items: [pipe2, pipe1], next_page_token: '' })
            // listCurrentJobs uses pipelines[0] = pipe2; main loop fetches pipe2 (new), skips pipe1 (unchanged)
            mockClient.listPipelineWorkflows
                .mockResolvedValueOnce({ items: [wf2], next_page_token: '' }) // listCurrentJobs
                .mockResolvedValueOnce({ items: [wf2], next_page_token: '' }) // main loop pipe2
            mockClient.listWorkflowJobs
                .mockResolvedValueOnce({ items: [newJob], next_page_token: '' }) // listCurrentJobs
                .mockResolvedValueOnce({ items: [newJob], next_page_token: '' }) // main loop pipe2

            const result = await new WorkflowFetcher(testProject, existingWorkflows).getProjectWorkflows()

            const history = result['build'].jobs[0].history
            expect(history).toHaveLength(2) // existing job + new job
            expect(history.some((h) => h.id === 'job-existing')).toBe(true)
            expect(history.some((h) => h.id === 'job-new')).toBe(true)
        })
    })

    describe('listCurrentJobs', () => {
        it('when includeBuildJobs=false, build-type jobs are excluded from results', async () => {
            const buildJob = makeWorkflowJob('j-build', 'ci-build', 'build')
            const approvalJob = makeWorkflowJob('j-approval', 'approve-deploy', 'approval')
            // Both have started_at so main loop won't filter them out
            setupSinglePipeline([buildJob, approvalJob])

            const fetcher = new WorkflowFetcher({ ...testProject, includeBuildJobs: false })
            const result = await fetcher.getProjectWorkflows()

            const jobNames = result['build']?.jobs.map((j) => j.name) ?? []
            expect(jobNames).not.toContain('ci-build')
            expect(jobNames).toContain('approve-deploy')
        })

        it('when includeBuildJobs=true, both build and approval jobs are included', async () => {
            const buildJob = makeWorkflowJob('j-build', 'ci-build', 'build')
            const approvalJob = makeWorkflowJob('j-approval', 'approve-deploy', 'approval')
            setupSinglePipeline([buildJob, approvalJob])

            const fetcher = new WorkflowFetcher({ ...testProject, includeBuildJobs: true })
            const result = await fetcher.getProjectWorkflows()

            const jobNames = result['build']?.jobs.map((j) => j.name) ?? []
            expect(jobNames).toContain('ci-build')
            expect(jobNames).toContain('approve-deploy')
        })

        it('when includeBuildJobs is unset, defaults to true and includes build jobs', async () => {
            const buildJob = makeWorkflowJob('j-build', 'ci-build', 'build')
            const approvalJob = makeWorkflowJob('j-approval', 'approve-deploy', 'approval')
            setupSinglePipeline([buildJob, approvalJob])

            const fetcher = new WorkflowFetcher(testProject) // no includeBuildJobs set
            const result = await fetcher.getProjectWorkflows()

            const jobNames = result['build']?.jobs.map((j) => j.name) ?? []
            expect(jobNames).toContain('ci-build')
            expect(jobNames).toContain('approve-deploy')
        })
    })
})
