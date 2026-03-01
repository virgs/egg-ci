import { describe, it, expect } from 'vitest'
import { RERUNABLE_STATUSES } from './jobActionUtils'
import { ALL_WORKFLOW_JOB_STATUSES } from '../../gateway/models/ListWorkflowJobsResponse'

describe('RERUNABLE_STATUSES', () => {
    const rerunable = ['success', 'failed', 'not_running', 'infrastructure_fail', 'timedout', 'canceled']
    const nonRerunable = ['running', 'queued', 'retried', 'blocked', 'not_run', 'on_hold', 'terminated-unknown', 'unauthorized']

    it.each(rerunable)('%s is rerunable', (status) => {
        expect(RERUNABLE_STATUSES.has(status as never)).toBe(true)
    })

    it.each(nonRerunable)('%s is not rerunable', (status) => {
        expect(RERUNABLE_STATUSES.has(status as never)).toBe(false)
    })

    it('covers all known statuses', () => {
        const all = new Set(ALL_WORKFLOW_JOB_STATUSES)
        const covered = new Set([...rerunable, ...nonRerunable])
        expect([...all].sort()).toEqual([...covered].sort())
    })
})
