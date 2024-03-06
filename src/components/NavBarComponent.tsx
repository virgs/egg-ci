import { useState } from 'react'
import eggIcon from '/egg-icon.png'
import { useUserInformationChangedListener } from '../events/Events'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'
import { SettingsRepository } from '../settings/SettingsRepository';

const settingsRepository: SettingsRepository = new SettingsRepository();
export const NavBarComponent = (): JSX.Element => {
    const [userInformation, setUserInformation] = useState<UserInformationResponse | undefined>(settingsRepository.getUserInformation())

    useUserInformationChangedListener(payload => setUserInformation(payload))

    return <nav className="navbar navbar-expand-lg bg-body-tertiary">
        <div className="container-fluid">
            <a className="navbar-brand" href="#">
                <img src={eggIcon} alt="Logo" width="30" height="24" className="d-inline-block align-text-top me-1" />
                {userInformation?.name}
            </a>
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="#">Dashboards</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#/settings">Settings</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link disabled" aria-disabled="true">Disabled</a>
                </li>
            </ul>
        </div>
    </nav>
}