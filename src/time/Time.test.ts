import { describe, it, expect } from 'vitest'
import { formatDuration } from './Time'
import { formatCountdownLabel } from './UseSyncCountdown'

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

describe('formatCountdownLabel', () => {
    it('returns "syncing…" when remaining is 0', () => {
        expect(formatCountdownLabel(0)).toBe('syncing…')
    })

    it('returns "syncing…" when remaining is negative', () => {
        expect(formatCountdownLabel(-1000)).toBe('syncing…')
    })

    it('returns "< 30s" for values up to 30 seconds', () => {
        expect(formatCountdownLabel(1)).toBe('< 30s')
        expect(formatCountdownLabel(15_000)).toBe('< 30s')
        expect(formatCountdownLabel(30_000)).toBe('< 30s')
    })

    it('returns "< 1m" for values between 30s and 1m', () => {
        expect(formatCountdownLabel(30_001)).toBe('< 1m')
        expect(formatCountdownLabel(60_000)).toBe('< 1m')
    })

    it('returns "< 2m" for values between 1m and 2m', () => {
        expect(formatCountdownLabel(60_001)).toBe('< 2m')
        expect(formatCountdownLabel(120_000)).toBe('< 2m')
    })

    it('returns "< 5m" for values between 2m and 5m', () => {
        expect(formatCountdownLabel(120_001)).toBe('< 5m')
        expect(formatCountdownLabel(300_000)).toBe('< 5m')
    })

    it('returns "< 10m" for values between 5m and 10m', () => {
        expect(formatCountdownLabel(300_001)).toBe('< 10m')
        expect(formatCountdownLabel(600_000)).toBe('< 10m')
    })

    it('returns "> 10m" for values above 10 minutes', () => {
        expect(formatCountdownLabel(600_001)).toBe('> 10m')
        expect(formatCountdownLabel(999_999_999)).toBe('> 10m')
    })
})

