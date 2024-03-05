import { LocalStorageRepository } from "../db/LocalStorageRepository";
import { Project } from "../project/Project";

export type SettingProject = (Project & {
    id: string;
});

export type SettingsData = {
    token?: string;
    projects: SettingProject[]
}

export class SettingsRepository extends LocalStorageRepository {
    private settings: SettingsData = {
        token: undefined,
        projects: []
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

    public addProject(project: Project) {
        const id = `${project.vcs_type}/${project.username}/${project.reponame}`;
        if (this.settings.projects
            .some(trackedProject => trackedProject.id === id)) {
            return;
        }
        this.settings.projects.push({
            ...project,
            id: id
        })
        this.persist();
    }

    public enableProject(id: string) {
        this.settings.projects = this.settings.projects
            .map(project => {
                if (project.id === id) {
                    project.enabled = true;
                }
                return project;
            })
        this.persist();
    }

    public disableProject(id: string) {
        this.settings.projects = this.settings.projects
            .map(project => {
                if (project.id === id) {
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
            projects: []
        }
    }
}