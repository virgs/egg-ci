import { Config, defaultConfig } from '../config'
import { LocalStorageRepository } from '../db/LocalStorageRepository'
import { WorkflowJobStatus } from '../gateway/models/ListWorkflowJobsResponse'
import { ProfileRepository } from '../profile/ProfileRepository'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'

export type WorkflowView = 'grid' | 'list'

const WORKFLOW_VIEW_KEY = 'workflowView'
const WORKFLOW_FILTER_TEXT_KEY = 'workflowFilterText'
const WORKFLOW_STATUS_FILTERS_KEY = 'workflowStatusFilters'

const profileRepository = new ProfileRepository()

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
        return (super.load(this.scopeKey(WORKFLOW_VIEW_KEY)) as WorkflowView | undefined) ?? 'grid'
    }

    public setWorkflowView(view: WorkflowView) {
        return this.persist(this.scopeKey(WORKFLOW_VIEW_KEY), view)
    }

    public getWorkflowFilterText(): string {
        return (super.load(this.scopeKey(WORKFLOW_FILTER_TEXT_KEY)) as string | undefined) ?? ''
    }

    public setWorkflowFilterText(text: string): void {
        this.persist(this.scopeKey(WORKFLOW_FILTER_TEXT_KEY), text)
    }

    public getWorkflowStatusFilters(): WorkflowJobStatus[] | undefined {
        return super.load(this.scopeKey(WORKFLOW_STATUS_FILTERS_KEY)) as WorkflowJobStatus[] | undefined
    }

    public setWorkflowStatusFilters(statuses: WorkflowJobStatus[]): void {
        this.persist(this.scopeKey(WORKFLOW_STATUS_FILTERS_KEY), statuses)
    }

    public clearApiToken() {
        this.delete('token')
        this.delete('userInformation')
    }

    private scopeKey(key: string): string {
        return profileRepository.scopedKey(key)
    }
}
