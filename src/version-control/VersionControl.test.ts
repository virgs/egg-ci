import { describe, it, expect } from 'vitest'
import { mapVersionControlFromString, getVersionControlSlug, VersionControlType } from './VersionControl'

describe('mapVersionControlFromString', () => {
    it('maps "github" → GITHUB', () => {
        expect(mapVersionControlFromString('github')).toBe(VersionControlType.GITHUB)
    })

    it('maps "gitlab" → GITLAB', () => {
        expect(mapVersionControlFromString('gitlab')).toBe(VersionControlType.GITLAB)
    })

    it('maps "bitbucket" → BITBUCKET', () => {
        expect(mapVersionControlFromString('bitbucket')).toBe(VersionControlType.BITBUCKET)
    })

    it('maps "githubapp" → GITHUB_APP', () => {
        expect(mapVersionControlFromString('githubapp')).toBe(VersionControlType.GITHUB_APP)
    })

    it('is case-insensitive — "GitHub" → GITHUB', () => {
        expect(mapVersionControlFromString('GitHub')).toBe(VersionControlType.GITHUB)
    })

    it('is case-insensitive — "GITHUB" → GITHUB', () => {
        expect(mapVersionControlFromString('GITHUB')).toBe(VersionControlType.GITHUB)
    })

    it('returns undefined for unknown string', () => {
        expect(mapVersionControlFromString('unknown')).toBeUndefined()
    })

    it('returns undefined for empty string', () => {
        expect(mapVersionControlFromString('')).toBeUndefined()
    })
})

describe('getVersionControlSlug', () => {
    it('GITHUB → "github"', () => {
        expect(getVersionControlSlug(VersionControlType.GITHUB)).toBe('github')
    })

    it('BITBUCKET → "bitbucket"', () => {
        expect(getVersionControlSlug(VersionControlType.BITBUCKET)).toBe('bitbucket')
    })

    it('GITLAB → "circleci"', () => {
        expect(getVersionControlSlug(VersionControlType.GITLAB)).toBe('circleci')
    })

    it('GITHUB_APP → "circleci"', () => {
        expect(getVersionControlSlug(VersionControlType.GITHUB_APP)).toBe('circleci')
    })
})
