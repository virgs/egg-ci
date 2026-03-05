import { describe, expect, it } from 'vitest'
import { resolveCircleCiBaseUrl } from './CircleCiClient'

describe('resolveCircleCiBaseUrl', () => {
    it('returns relative base in development', () => {
        expect(resolveCircleCiBaseUrl(true, undefined)).toBe('')
    })

    it('uses provided proxy URL in production and trims trailing slash', () => {
        expect(resolveCircleCiBaseUrl(false, 'https://egg-ci-proxy.example.workers.dev/')).toBe(
            'https://egg-ci-proxy.example.workers.dev'
        )
    })

    it('falls back to circleci host in production when proxy URL is empty', () => {
        expect(resolveCircleCiBaseUrl(false, '  ')).toBe('https://circleci.com')
    })
})
