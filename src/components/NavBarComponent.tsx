import { faUser, faWrench } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import { useUserInformationChangedListener } from '../events/Events'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'
import { SettingsRepository } from '../settings/SettingsRepository'
import eggIcon from '/egg-icon.png'
import "./NavBarComponent.scss"

const settingsRepository: SettingsRepository = new SettingsRepository()
export const NavBarComponent = (): JSX.Element => {
    const [userInformation, setUserInformation] = useState<UserInformationResponse | undefined>(
        settingsRepository.getUserInformation()
    )

    useUserInformationChangedListener((payload) => setUserInformation(payload))

    return (
        <nav className="navbar navbar-expand sticky-top border-bottom bg-body-tertiary">
            <div className="container-fluid px-5">
                <span className="navbar-brand">
                    <img
                        src={eggIcon}
                        alt="Logo"
                        width="30"
                        height="auto"
                        className="d-inline-block align-text-top me-2"
                    />
                    Egg CI
                </span>
                <div className='w-100'>
                    <ul className="navbar-nav w-100 justify-content-between align-items-center">
                        <li className="nav-item">
                            <a className="nav-link active" aria-current="page" href="#">Dashboard</a>
                        </li>
                        <li className="nav-item dropdown">
                            <div>
                                <span className="dropdown-toggle" data-bs-toggle="dropdown" data-bs-display="static" aria-expanded="false">
                                    <FontAwesomeIcon className='me-2' icon={faUser} />
                                    {userInformation?.name ?? 'No token'}
                                </span>
                                <ul className="dropdown-menu">
                                    <li>
                                        <a className="dropdown-item d-flex align-items-center" href="#/settings">
                                            <FontAwesomeIcon className="me-2" icon={faWrench} />
                                            Settings
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}
