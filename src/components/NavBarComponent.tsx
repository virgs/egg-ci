import { useState } from 'react'
import eggIcon from '/egg-icon.png'
import { useUserInformationChangedListener } from '../events/Events'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'
import { SettingsRepository } from '../settings/SettingsRepository';

const settingsRepository: SettingsRepository = new SettingsRepository();
export const NavBarComponent = (): JSX.Element => {
    const [userInformation, setUserInformation] = useState<UserInformationResponse | undefined>(settingsRepository.getUserInformation())

    useUserInformationChangedListener(payload => setUserInformation(payload))

    return <nav className="navbar sticky-top bg-body-tertiary">
        <div className="container-fluid justify-content-between">
            <a className="navbar-brand" href="#">
                <img src={eggIcon} alt="Logo" width="30" height="24" className="d-inline-block align-text-top me-1" />
                {userInformation?.name}
            </a>
            {/* <div className="collapse navbar-collapse" id="navbarText">
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item">
                        <a className="nav-link active" aria-current="page" href="#">Home</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Features</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Pricing</a>
                    </li>
                </ul>
                <span className="navbar-text">
                    Navbar text with an inline element
                </span>
            </div> */}
            {/* <span className="navbar-text">
                Navbar text with an inline element
            </span> */}
            <a className='navbar-text' href="#/settings" style={{ cursor: 'pointer' }}>Settings</a>
            {/* <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <li className="nav-item">
                    <a className="nav-link active" aria-current="page" href="#">Dashboards</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#/settings">Settings</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link disabled" aria-disabled="true">Disabled</a>
                </li>
            </ul> */}
        </div>
    </nav>
}