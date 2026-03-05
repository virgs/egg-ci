import { LocalStorageRepository } from '../db/LocalStorageRepository'
import { DEFAULT_PROFILE, Profile } from './models'

const PROFILES_KEY = 'profiles'
const ACTIVE_PROFILE_KEY = 'activeProfileId'
const PROFILE_SUFFIX = ':profile:'
const PROFILE_SCOPED_KEYS = ['trackedProjects', 'project', 'workflowView', 'workflowFilterText', 'workflowStatusFilters']

export class ProfileRepository extends LocalStorageRepository {
    public constructor() {
        super()
        this.ensureInitialized()
    }

    public getProfiles(): Profile[] {
        this.ensureInitialized()
        return (this.load(PROFILES_KEY) as Profile[] | undefined) ?? [DEFAULT_PROFILE]
    }

    public getActiveProfile(): Profile {
        this.ensureInitialized()
        const activeId = (this.load(ACTIVE_PROFILE_KEY) as string | undefined) ?? DEFAULT_PROFILE.id
        const profiles = this.getProfiles()
        return profiles.find((profile) => profile.id === activeId) ?? profiles[0]
    }

    public setActiveProfile(id: string): void {
        const exists = this.getProfiles().some((profile) => profile.id === id)
        if (!exists) return
        this.persist(ACTIVE_PROFILE_KEY, id)
    }

    public addProfile(name: string): Profile {
        const trimmed = name.trim()
        if (!trimmed) throw new Error('Profile name is required')

        const profiles = this.getProfiles()
        const existing = profiles.map((p) => p.name.toLowerCase())
        if (existing.includes(trimmed.toLowerCase())) {
            throw new Error('Profile name already exists')
        }

        const newProfile: Profile = {
            id: `profile-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: trimmed,
        }
        this.persist(PROFILES_KEY, [...profiles, newProfile])
        return newProfile
    }

    public updateProfile(id: string, name: string): void {
        const trimmed = name.trim()
        if (!trimmed) throw new Error('Profile name is required')

        const profiles = this.getProfiles()
        const isUnique = !profiles.some(
            (p) => p.id !== id && p.name.toLowerCase() === trimmed.toLowerCase()
        )
        if (!isUnique) throw new Error('Profile name already exists')

        const next = profiles.map((profile) => {
            if (profile.id !== id) return profile
            return { ...profile, name: trimmed }
        })
        this.persist(PROFILES_KEY, next)
    }

    public deleteProfile(id: string): boolean {
        const profiles = this.getProfiles()
        if (profiles.length <= 1) return false

        const remaining = profiles.filter((profile) => profile.id !== id)
        if (remaining.length === profiles.length) return false

        this.persist(PROFILES_KEY, remaining)
        const active = this.getActiveProfile()
        if (active.id === id) {
            this.persist(ACTIVE_PROFILE_KEY, remaining[0].id)
        }
        this.clearProfileScopedData(id)
        return true
    }

    public scopedKey(baseKey: string, profileId?: string): string {
        const id = profileId ?? this.getActiveProfile().id
        return `${baseKey}${PROFILE_SUFFIX}${id}`
    }

    public getNextProfileName(): string {
        const profiles = this.getProfiles()
        let index = 1
        while (profiles.some((p) => p.name === `Egg profile (${index})`)) {
            index += 1
        }
        return `Egg profile (${index})`
    }

    private ensureInitialized(): void {
        const profiles = this.load(PROFILES_KEY) as Profile[] | undefined
        if (!profiles || profiles.length === 0) {
            this.persist(PROFILES_KEY, [DEFAULT_PROFILE])
        }
        const active = this.load(ACTIVE_PROFILE_KEY) as string | undefined
        if (!active) {
            this.persist(ACTIVE_PROFILE_KEY, DEFAULT_PROFILE.id)
        }
    }

    private clearProfileScopedData(profileId: string): void {
        const prefixes = PROFILE_SCOPED_KEYS.map((key) => `${key}${PROFILE_SUFFIX}${profileId}`)
        const storageKeys = this.getRawLocalStorageKeys()

        storageKeys.forEach((storageKey) => {
            const plain = this.decodeStorageKey(storageKey)
            if (prefixes.some((prefix) => plain === prefix || plain.startsWith(`${prefix}:`))) {
                localStorage.removeItem(storageKey)
            }
        })
    }

    private getRawLocalStorageKeys(): string[] {
        const keys: string[] = []
        for (let i = 0; i < localStorage.length; i += 1) {
            const key = localStorage.key(i)
            if (key) keys.push(key)
        }
        return keys
    }

    private decodeStorageKey(storageKey: string): string {
        if (import.meta.env.DEV) return storageKey
        try {
            return atob(storageKey)
        } catch {
            return storageKey
        }
    }
}

