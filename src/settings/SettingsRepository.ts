import { Config, defaultConfig } from '../config'
import { LocalStorageRepository } from '../db/LocalStorageRepository'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'
import { Theme } from '../theme/ThemeManager'

export type WorkflowView = 'grid' | 'list'

export class SettingsRepository extends LocalStorageRepository {
    public setApiToken(token: string) {
        return this.persist('token', token)
    }

    public getApiToken(): string | undefined {
        return super.load('token') as string | undefined
    }

    public setUserInformation(userInformation: UserInformationResponse) {
        return this.persist('userInformation', userInformation)
    }

    public getUserInformation(): UserInformationResponse | undefined {
        return super.load('userInformation') as UserInformationResponse | undefined
    }

    public getConfiguration(): Config {
        return (super.load('configuration') as Config | undefined) ?? defaultConfig
    }

    public setConfiguration(configuration: Config) {
        return this.persist('configuration', configuration)
    }

    public getWorkflowView(): WorkflowView {
        return (super.load('workflowView') as WorkflowView | undefined) ?? 'grid'
    }

    public setWorkflowView(view: WorkflowView) {
        return this.persist('workflowView', view)
    }

    public getTheme(): Theme {
        return (super.load('theme') as Theme | undefined) ?? 'light'
    }

    public setTheme(theme: Theme) {
        return this.persist('theme', theme)
    }

    public clearApiToken() {
        this.delete('token')
        this.delete('userInformation')
    }
}
