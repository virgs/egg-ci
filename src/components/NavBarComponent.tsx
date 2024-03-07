import { faChartColumn, faWrench } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { useUserInformationChangedListener } from '../events/Events'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'
import { SettingsRepository } from '../settings/SettingsRepository'
import eggIcon from '/egg-icon.png'

const settingsRepository: SettingsRepository = new SettingsRepository()
export const NavBarComponent = (): JSX.Element => {
    const [_, setUserInformation] = useState<UserInformationResponse | undefined>(
        settingsRepository.getUserInformation()
    )

    useUserInformationChangedListener((payload) => setUserInformation(payload))

    return (
        <nav className="navbar sticky-top bg-body-tertiary" style={{ borderBottom: '1px solid var(--bs-gray)' }}>
            <div className="container-fluid px-5 justify-content-between">
                <a className="navbar-brand" href="#">
                    <img
                        src={eggIcon}
                        alt="Logo"
                        width="30"
                        height="24"
                        className="d-inline-block align-text-top me-2"
                    />
                    Egg CI
                </a>
                <a className="navbar-text" href="#/settings" style={{ cursor: 'pointer' }}>
                    <FontAwesomeIcon className="mx-2" icon={faWrench} />
                    Settings
                </a>
            </div>
        </nav>
    )
}
