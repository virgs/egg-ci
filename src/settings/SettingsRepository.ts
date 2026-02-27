import { Config, defaultConfig } from '../config'
import { LocalStorageRepository } from '../db/LocalStorageRepository'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'

export type WorkflowView = 'grid' | 'list'

export class SettingsRepository extends LocalStorageRepository {
    public setApiToken(token: string) {
        return this.persist('token', token)
    }

    public getApiToken(): string | undefined {
        return super.load('token')
    }

    public setUserInformation(userInformation: UserInformationResponse) {
        return this.persist('userInformation', userInformation)
    }

    public getUserInformation(): UserInformationResponse | undefined {
        return super.load('userInformation')
    }

    public getConfiguration(): Config {
        return super.load('configuration') ?? defaultConfig
    }

    public setConfiguration(configuration: Config) {
        return this.persist('configuration', configuration)
    }

    public getWorkflowView(): WorkflowView {
        return super.load('workflowView') ?? 'grid'
    }

    public setWorkflowView(view: WorkflowView) {
        return this.persist('workflowView', view)
    }

    public clearApiToken() {
        this.delete('token')
        this.delete('userInformation')
    }
}
