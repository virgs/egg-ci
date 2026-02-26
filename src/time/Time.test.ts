import { describe, it, expect } from 'vitest'
import { formatDuration } from './Time'

describe('formatDuration', () => {
    it('returns empty string for 0ms', () => {
        expect(formatDuration(0)).toBe('')
    })

    it('treats negative values as positive', () => {
        expect(formatDuration(-3600000)).toBe(formatDuration(3600000))
    })

    it('handles exact 1 day boundary', () => {
        expect(formatDuration(86400000)).toBe('1d')
    })

    it('handles multi-unit output (1h 2m 3s)', () => {
        // 1h + 2m + 3s = 3723000ms — default numberOfRelevantUnits=2 → "1h 2m"
        expect(formatDuration(3723000)).toBe('1h 2m')
    })

    it('skips units with value 0 (e.g. 1h 0m → "1h")', () => {
        expect(formatDuration(3600000)).toBe('1h')
    })

    it('numberOfRelevantUnits=1 limits to most significant unit', () => {
        expect(formatDuration(3723000, 1)).toBe('1h')
    })

    it('numberOfRelevantUnits=3 shows up to three units', () => {
        // 1h 2m 3s
        expect(formatDuration(3723000, 3)).toBe('1h 2m 3s')
    })

    it('handles minutes only', () => {
        expect(formatDuration(20 * 60 * 1000)).toBe('20m')
    })

    it('handles seconds only', () => {
        expect(formatDuration(45000)).toBe('45s')
    })

    it('handles days and hours', () => {
        // 1d + 3h = 97200000ms
        expect(formatDuration(97200000)).toBe('1d 3h')
    })
})
