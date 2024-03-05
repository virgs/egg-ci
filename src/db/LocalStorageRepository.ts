import { RepositoryListener } from "./Repository";

export abstract class LocalStorageRepository {
    private readonly cryptData: boolean = !import.meta.env.DEV;
    private listeners: RepositoryListener[] = [];

    public persist(key: string, data: object) {
        if (this.cryptData) {
            localStorage.setItem(btoa(key), btoa(JSON.stringify(data)));
        } else {
            localStorage.setItem(key, JSON.stringify(data));
        }
        this.listeners.forEach(listener => listener(data));
    }

    public load(key: string): object | undefined {
        const decodedKey = this.cryptData ? btoa(key) : key;
        const persisted = localStorage.getItem(decodedKey);
        if (persisted) {
            if (this.cryptData) {
                return JSON.parse(atob(persisted));
            } else {
                return JSON.parse(persisted);
            }
        }
        return undefined;
    }

    public onChange(listener: RepositoryListener) {
        this.listeners.push(listener);
    }

}
