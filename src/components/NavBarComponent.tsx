import { faTrash, faUser, faWrench } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useState } from 'react'
import { emitLoggedOut, useUserInformationChangedListener } from '../events/Events'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'
import { SettingsRepository } from '../settings/SettingsRepository'
import eggIcon from '/egg-icon.png'
import './NavBarComponent.scss'
import { useNavigate } from 'react-router-dom'

const settingsRepository: SettingsRepository = new SettingsRepository()
export const NavBarComponent = (): ReactElement => {
    const navigate = useNavigate()

    const [userInformation, setUserInformation] = useState<UserInformationResponse | undefined>(
        settingsRepository.getUserInformation()
    )

    useUserInformationChangedListener((payload) => setUserInformation(payload))

    return (
        <nav className="navbar navbar-expand sticky-top border-bottom bg-primary" data-bs-theme="dark">
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
                <div className="w-100">
                    <ul className="navbar-nav w-100 justify-content-between align-items-center">
                        <li className="nav-item">
                            <button
                                className="nav-link active"
                                aria-current="page"
                                onPointerDown={() => navigate('/#', { relative: 'route' })}
                            >
                                Dashboard
                            </button>
                        </li>
                        <li className="nav-item dropdown">
                            <div>
                                <div
                                    className="dropdown-toggle nav-link active"
                                    data-bs-toggle="dropdown"
                                    data-bs-display="static"
                                    aria-expanded="false"
                                >
                                    <FontAwesomeIcon className="me-2" icon={faUser} />
                                    {userInformation?.name ?? 'No token'}
                                </div>
                                <ul className="dropdown-menu">
                                    <li>
                                        <button
                                            className="dropdown-item d-flex align-items-center"
                                            onPointerDown={() => navigate('/settings', { relative: 'route' })}
                                        >
                                            <FontAwesomeIcon className="me-2" icon={faWrench} />
                                            Settings
                                        </button>
                                    </li>
                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item d-flex align-items-center"
                                            onPointerDown={() => {
                                                emitLoggedOut()
                                                localStorage.clear()
                                                navigate('/settings', { relative: 'route' })
                                            }}
                                        >
                                            <FontAwesomeIcon className="me-2" icon={faTrash} />
                                            Clear data
                                        </button>
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
