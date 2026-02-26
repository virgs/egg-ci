import { describe, it, expect, beforeEach } from 'vitest'
import { SettingsRepository } from './SettingsRepository'
import { defaultConfig } from '../config'

describe('SettingsRepository', () => {
    let repo: SettingsRepository

    beforeEach(() => {
        localStorage.clear()
        repo = new SettingsRepository()
    })

    it('setApiToken / getApiToken round-trip', () => {
        repo.setApiToken('my-secret-token')
        expect(repo.getApiToken()).toBe('my-secret-token')
    })

    it('getApiToken returns undefined when not set', () => {
        expect(repo.getApiToken()).toBeUndefined()
    })

    it('setUserInformation / getUserInformation round-trip', () => {
        const user = { id: 'u1', login: 'johndoe', name: 'John Doe' }
        repo.setUserInformation(user)
        expect(repo.getUserInformation()).toEqual(user)
    })

    it('getUserInformation returns undefined when not set', () => {
        expect(repo.getUserInformation()).toBeUndefined()
    })

    it('getConfiguration returns defaultConfig when nothing stored', () => {
        expect(repo.getConfiguration()).toEqual(defaultConfig)
    })

    it('setConfiguration / getConfiguration round-trip', () => {
        const custom = { ...defaultConfig, jobExecutionsMaxHistory: 5, includeBuildJobs: true }
        repo.setConfiguration(custom)
        expect(repo.getConfiguration()).toEqual(custom)
    })
})
