
export interface Repository {
    persist(key: string, data: object): void;
    load(key: string): object | undefined;
    onChange(listener: RepositoryListener): void;
}

export type RepositoryListener = (payload: object) => void;
