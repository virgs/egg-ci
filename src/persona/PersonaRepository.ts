import { LocalStorageRepository } from '../db/LocalStorageRepository'
import { DEFAULT_PERSONA, Persona, PersonaAvatar } from './models'

const PERSONAS_KEY = 'personas'
const ACTIVE_PERSONA_KEY = 'activePersonaId'
const PERSONA_SUFFIX = ':persona:'
const PERSONA_SCOPED_KEYS = ['trackedProjects', 'project', 'workflowView', 'workflowFilterText', 'workflowStatusFilters']

export class PersonaRepository extends LocalStorageRepository {
    public constructor() {
        super()
        this.ensureInitialized()
    }

    public getPersonas(): Persona[] {
        this.ensureInitialized()
        return (this.load(PERSONAS_KEY) as Persona[] | undefined) ?? [DEFAULT_PERSONA]
    }

    public getActivePersona(): Persona {
        this.ensureInitialized()
        const activeId = (this.load(ACTIVE_PERSONA_KEY) as string | undefined) ?? DEFAULT_PERSONA.id
        const personas = this.getPersonas()
        return personas.find((persona) => persona.id === activeId) ?? personas[0]
    }

    public setActivePersona(id: string): void {
        const exists = this.getPersonas().some((persona) => persona.id === id)
        if (!exists) return
        this.persist(ACTIVE_PERSONA_KEY, id)
    }

    public addPersona(name: string, avatar: PersonaAvatar): Persona {
        const trimmed = name.trim()
        if (!trimmed) throw new Error('Persona name is required')

        const newPersona: Persona = {
            id: `persona-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: trimmed,
            avatar,
        }
        const personas = this.getPersonas()
        this.persist(PERSONAS_KEY, [...personas, newPersona])
        return newPersona
    }

    public updatePersona(id: string, updates: Partial<Pick<Persona, 'name' | 'avatar'>>): void {
        const personas = this.getPersonas()
        const next = personas.map((persona) => {
            if (persona.id !== id) return persona
            const name = updates.name !== undefined ? updates.name.trim() : persona.name
            return {
                ...persona,
                name: name || persona.name,
                avatar: updates.avatar ?? persona.avatar,
            }
        })
        this.persist(PERSONAS_KEY, next)
    }

    public deletePersona(id: string): boolean {
        const personas = this.getPersonas()
        if (personas.length <= 1) return false

        const remaining = personas.filter((persona) => persona.id !== id)
        if (remaining.length === personas.length) return false

        this.persist(PERSONAS_KEY, remaining)
        const active = this.getActivePersona()
        if (active.id === id) {
            this.persist(ACTIVE_PERSONA_KEY, remaining[0].id)
        }
        this.clearPersonaScopedData(id)
        return true
    }

    public scopedKey(baseKey: string, personaId?: string): string {
        const id = personaId ?? this.getActivePersona().id
        return `${baseKey}${PERSONA_SUFFIX}${id}`
    }

    private ensureInitialized(): void {
        const personas = this.load(PERSONAS_KEY) as Persona[] | undefined
        if (!personas || personas.length === 0) {
            this.persist(PERSONAS_KEY, [DEFAULT_PERSONA])
        }
        const active = this.load(ACTIVE_PERSONA_KEY) as string | undefined
        if (!active) {
            this.persist(ACTIVE_PERSONA_KEY, DEFAULT_PERSONA.id)
        }
    }

    private clearPersonaScopedData(personaId: string): void {
        const prefixes = PERSONA_SCOPED_KEYS.map((key) => `${key}${PERSONA_SUFFIX}${personaId}`)
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

