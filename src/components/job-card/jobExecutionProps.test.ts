import { describe, it, expect } from 'vitest'
import { jobExecutionProps } from './jobExecutionProps'
import type { WorkflowJob } from '../../gateway/models/ListWorkflowJobsResponse'

function makeJob(status: WorkflowJob['status']): WorkflowJob {
    return {
        id: 'test-id',
        name: 'test-job',
        project_slug: 'gh/org/repo',
        status,
        type: 'build',
        dependencies: [],
    }
}

describe('jobExecutionProps', () => {
    it('success → color: success, animated: false', () => {
        const result = jobExecutionProps(makeJob('success'))
        expect(result.color).toBe('success')
        expect(result.animated).toBe(false)
    })

    it('running → color: warning, animated: true', () => {
        const result = jobExecutionProps(makeJob('running'))
        expect(result.color).toBe('warning')
        expect(result.animated).toBe(true)
    })

    it('on_hold → color: info, animated: true', () => {
        const result = jobExecutionProps(makeJob('on_hold'))
        expect(result.color).toBe('info')
        expect(result.animated).toBe(true)
    })

    it('blocked → color: info, animated: true', () => {
        const result = jobExecutionProps(makeJob('blocked'))
        expect(result.color).toBe('info')
        expect(result.animated).toBe(true)
    })

    it('queued → color: info, animated: true', () => {
        const result = jobExecutionProps(makeJob('queued'))
        expect(result.color).toBe('info')
        expect(result.animated).toBe(true)
    })

    it('retried → color: info, animated: true', () => {
        const result = jobExecutionProps(makeJob('retried'))
        expect(result.color).toBe('info')
        expect(result.animated).toBe(true)
    })

    it('canceled → color: dark, animated: false', () => {
        const result = jobExecutionProps(makeJob('canceled'))
        expect(result.color).toBe('dark')
        expect(result.animated).toBe(false)
    })

    it('terminated-unknown → color: dark, animated: false', () => {
        const result = jobExecutionProps(makeJob('terminated-unknown'))
        expect(result.color).toBe('dark')
        expect(result.animated).toBe(false)
    })

    it('unauthorized → color: dark, animated: false', () => {
        const result = jobExecutionProps(makeJob('unauthorized'))
        expect(result.color).toBe('dark')
        expect(result.animated).toBe(false)
    })

    it('failed → color: danger, animated: false', () => {
        const result = jobExecutionProps(makeJob('failed'))
        expect(result.color).toBe('danger')
        expect(result.animated).toBe(false)
    })

    it('not_running → color: danger, animated: false', () => {
        const result = jobExecutionProps(makeJob('not_running'))
        expect(result.color).toBe('danger')
        expect(result.animated).toBe(false)
    })

    it('infrastructure_fail → color: danger, animated: false', () => {
        const result = jobExecutionProps(makeJob('infrastructure_fail'))
        expect(result.color).toBe('danger')
        expect(result.animated).toBe(false)
    })

    it('timedout → color: danger, animated: false', () => {
        const result = jobExecutionProps(makeJob('timedout'))
        expect(result.color).toBe('danger')
        expect(result.animated).toBe(false)
    })

    it('not_run → color: danger, animated: false', () => {
        const result = jobExecutionProps(makeJob('not_run'))
        expect(result.color).toBe('danger')
        expect(result.animated).toBe(false)
    })
})
