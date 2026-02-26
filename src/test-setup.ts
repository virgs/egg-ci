import { vi, afterEach } from 'vitest'

// jsdom 28.x doesn't fully implement localStorage — provide a working in-memory mock
const createLocalStorageMock = () => {
    let store: Map<string, string> = new Map()
    return {
        get length() {
            return store.size
        },
        clear() {
            store = new Map()
        },
        getItem(key: string) {
            return store.get(key) ?? null
        },
        setItem(key: string, value: string) {
            store.set(key, value)
        },
        removeItem(key: string) {
            store.delete(key)
        },
        key(index: number) {
            return Array.from(store.keys())[index] ?? null
        },
    }
}

vi.stubGlobal('localStorage', createLocalStorageMock())

afterEach(() => {
    vi.unstubAllEnvs()
})
