import { describe, it, expect, beforeEach, vi } from 'vitest'
import { LocalStorageRepository } from './LocalStorageRepository'

class TestRepository extends LocalStorageRepository {
    persistPublic(key: string, data: any) {
        return this.persist(key, data)
    }
    loadPublic(key: string) {
        return this.load(key)
    }
}

describe('LocalStorageRepository', () => {
    let repo: TestRepository

    beforeEach(() => {
        localStorage.clear()
        repo = new TestRepository()
    })

    describe('DEV mode (plain JSON)', () => {
        it('persist + load round-trip', () => {
            repo.persistPublic('myKey', { value: 42 })
            expect(repo.loadPublic('myKey')).toEqual({ value: 42 })
        })

        it('load returns undefined for missing key', () => {
            expect(repo.loadPublic('nonExistent')).toBeUndefined()
        })

        it('handles complex nested objects', () => {
            const complex = { a: { b: { c: [1, 2, 3] } }, d: 'hello', e: true }
            repo.persistPublic('complexKey', complex)
            expect(repo.loadPublic('complexKey')).toEqual(complex)
        })

        it('onChange listener is called on persist', () => {
            const listener = vi.fn()
            repo.onChange(listener)
            repo.persistPublic('key', { x: 1 })
            expect(listener).toHaveBeenCalledOnce()
            expect(listener).toHaveBeenCalledWith({ x: 1 })
        })

        it('multiple listeners all fire', () => {
            const listener1 = vi.fn()
            const listener2 = vi.fn()
            repo.onChange(listener1)
            repo.onChange(listener2)
            repo.persistPublic('key', 'hello')
            expect(listener1).toHaveBeenCalledOnce()
            expect(listener2).toHaveBeenCalledOnce()
        })
    })

    describe('PROD mode (base64 encoded)', () => {
        beforeEach(() => {
            vi.stubEnv('DEV', false)
            localStorage.clear()
            repo = new TestRepository()
        })

        it('persist + load round-trip with base64 encoding', () => {
            repo.persistPublic('secretKey', { token: 'abc123' })
            expect(repo.loadPublic('secretKey')).toEqual({ token: 'abc123' })
        })

        it('stored data is base64-encoded (not plain text)', () => {
            repo.persistPublic('myKey', { value: 99 })
            const rawKey = btoa('myKey')
            const rawValue = localStorage.getItem(rawKey)
            expect(rawValue).not.toBeNull()
            // Should be base64 of JSON
            expect(rawValue).toBe(btoa(JSON.stringify({ value: 99 })))
        })
    })
})
