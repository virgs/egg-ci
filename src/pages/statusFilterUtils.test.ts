import { describe, expect, it } from 'vitest'
import { ALL_JOB_STATUSES, matchesStatusFilter, parseStatusFilters, serializeStatusFilters } from './statusFilterUtils'

describe('statusFilterUtils', () => {
    describe('ALL_JOB_STATUSES', () => {
        it('contains 14 statuses', () => {
            expect(ALL_JOB_STATUSES).toHaveLength(14)
        })

        it('includes the primary statuses', () => {
            expect(ALL_JOB_STATUSES).toContain('success')
            expect(ALL_JOB_STATUSES).toContain('running')
            expect(ALL_JOB_STATUSES).toContain('failed')
            expect(ALL_JOB_STATUSES).toContain('on_hold')
            expect(ALL_JOB_STATUSES).toContain('canceled')
        })
    })

    describe('parseStatusFilters', () => {
        it('returns all statuses when param is null (default — no URL param)', () => {
            const result = parseStatusFilters(null)
            expect(result).toHaveLength(ALL_JOB_STATUSES.length)
            expect(result).toEqual(expect.arrayContaining(ALL_JOB_STATUSES))
        })

        it('returns empty array for empty string (all unchecked)', () => {
            expect(parseStatusFilters('')).toEqual([])
        })

        it('parses a single status', () => {
            expect(parseStatusFilters('failed')).toEqual(['failed'])
        })

        it('parses comma-separated statuses', () => {
            expect(parseStatusFilters('success,running,failed')).toEqual(['success', 'running', 'failed'])
        })

        it('filters out empty segments', () => {
            expect(parseStatusFilters('success,,failed')).toEqual(['success', 'failed'])
        })
    })

    describe('serializeStatusFilters', () => {
        it('returns empty string for empty array', () => {
            expect(serializeStatusFilters([])).toBe('')
        })

        it('serializes a single status', () => {
            expect(serializeStatusFilters(['success'])).toBe('success')
        })

        it('joins multiple statuses with comma', () => {
            expect(serializeStatusFilters(['success', 'running'])).toBe('success,running')
        })

        it('round-trips with parseStatusFilters', () => {
            const original: typeof ALL_JOB_STATUSES = ['success', 'running', 'failed']
            expect(parseStatusFilters(serializeStatusFilters(original))).toEqual(original)
        })
    })

    describe('matchesStatusFilter', () => {
        it('shows all jobs when all statuses are in the filter (default — no restriction)', () => {
            expect(matchesStatusFilter('success', ALL_JOB_STATUSES)).toBe(true)
            expect(matchesStatusFilter('failed', ALL_JOB_STATUSES)).toBe(true)
        })

        it('hides all jobs when filters are empty (all unchecked)', () => {
            expect(matchesStatusFilter('success', [])).toBe(false)
            expect(matchesStatusFilter('failed', [])).toBe(false)
        })

        it('shows job when its status is in the partial filter list', () => {
            expect(matchesStatusFilter('success', ['success', 'failed'])).toBe(true)
        })

        it('hides job when its status is not in the partial filter list', () => {
            expect(matchesStatusFilter('running', ['success', 'failed'])).toBe(false)
        })

        it('hides job when status is undefined and filters are empty', () => {
            expect(matchesStatusFilter(undefined, [])).toBe(false)
        })

        it('shows job when status is undefined and some filters are active', () => {
            expect(matchesStatusFilter(undefined, ['success'])).toBe(true)
        })
    })
})
