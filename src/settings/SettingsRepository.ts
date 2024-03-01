import { ProjectsResponse } from "../circleci/models/ProjectsResponse";

export interface TrackedProject {
    slug: string;
    enabled: boolean;
    data: ProjectsResponse;
}

type SettingsData = {
    token?: string;
    trackedProjects: TrackedProject[]
}

export interface Repository {
    persist(key: string, data: object): void;
    load(key: string): object | undefined;
}

export abstract class CachedRepository implements Repository {
    private readonly cryptData: boolean = !import.meta.env.DEV

    public persist(key: string, data: object) {
        if (this.cryptData) {
            localStorage.setItem(btoa(key), btoa(JSON.stringify(data)))
        } else {
            localStorage.setItem(key, JSON.stringify(data))
        }
    }

    public load(key: string): object | undefined {
        const decodedKey = this.cryptData ? btoa(key) : key
        const persisted = localStorage.getItem(decodedKey)
        if (persisted) {
            if (this.cryptData) {
                return JSON.parse(atob(persisted))
            } else {
                return JSON.parse(persisted)
            }
        }
        return undefined
    }
}

export class SettingsRepository extends CachedRepository {
    private settings: SettingsData = {
        token: undefined,
        trackedProjects: []
    }

    public constructor() {
        super()
        this.settings = this.load()
    }

    public get data(): SettingsData {
        return JSON.parse(JSON.stringify(this.settings));
    }

    public setApiToken(token: string) {
        this.settings.token = token;
        this.persist();
    }

    public addProject(projectSlug: string, project: ProjectsResponse) {
        this.settings.trackedProjects.push({
            enabled: false,
            slug: projectSlug,
            data: project
        })
        this.persist();
    }

    public enableProject(projectSlug: string) {
        this.settings.trackedProjects = this.settings.trackedProjects
            .map(project => {
                if (project.slug === projectSlug) {
                    project.enabled = true;
                }
                return project;
            })
        this.persist();
    }

    public disableProject(projectSlug: string) {
        this.settings.trackedProjects = this.settings.trackedProjects
            .map(project => {
                if (project.slug === projectSlug) {
                    project.enabled = false;
                }
                return project;
            })
        this.persist();
    }

    public persist() {
        return super.persist(SettingsRepository.name, this.data)
    }

    public load(): SettingsData {
        const persisted = super.load(SettingsRepository.name);
        if (persisted) {
            return persisted as SettingsData
        }
        return {
            trackedProjects: []
        }
    }
}