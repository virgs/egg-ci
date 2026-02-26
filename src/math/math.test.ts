import { describe, it, expect } from 'vitest'
import { hash } from './math'

describe('hash', () => {
    it('is deterministic — same input produces same output', async () => {
        const a = await hash('hello')
        const b = await hash('hello')
        expect(a).toBe(b)
    })

    it('different inputs produce different outputs', async () => {
        const a = await hash('hello')
        const b = await hash('world')
        expect(a).not.toBe(b)
    })

    it('output is a valid base64 string', async () => {
        const result = await hash('test')
        // base64 chars: A-Z a-z 0-9 + / =
        expect(result).toMatch(/^[A-Za-z0-9+/]+=*$/)
    })

    it('empty string produces a hash', async () => {
        const result = await hash('')
        expect(result).toBeTruthy()
        expect(typeof result).toBe('string')
    })
})
