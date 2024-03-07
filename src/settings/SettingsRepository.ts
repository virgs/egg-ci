import { LocalStorageRepository } from '../db/LocalStorageRepository'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'

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
}
