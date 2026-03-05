import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useState } from 'react'
import { Container, Dropdown, Nav, Navbar } from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { emitProfileChanged, useLoggedOutListener, useProfileChangedListener, useUserInformationChangedListener } from '../events/Events'
import { ProfileRepository } from '../profile/ProfileRepository'
import logo from '/logo.png'
import { SettingsRepository } from '../settings/SettingsRepository'
import './NavBarComponent.scss'
import { faMugHot, faUser } from '@fortawesome/free-solid-svg-icons'

const settingsRepository = new SettingsRepository()
const profileRepository = new ProfileRepository()

export const NavBarComponent = (): ReactElement => {
    const navigate = useNavigate()
    const [hasApiToken, setHasApiToken] = useState(() => !!settingsRepository.getApiToken())
    const [, setProfileRefreshTick] = useState(0)

    const profiles = profileRepository.getProfiles()
    const activeProfile = profileRepository.getActiveProfile()

    useUserInformationChangedListener(() => setHasApiToken(!!settingsRepository.getApiToken()))
    useLoggedOutListener(() => setHasApiToken(false))
    useProfileChangedListener(() => setProfileRefreshTick((prev) => prev + 1))

    const handleProfileSwitch = (profileId: string): void => {
        profileRepository.setActiveProfile(profileId)
        emitProfileChanged(profileRepository.getActiveProfile().id)
    }

    return (
        <Navbar expand bg="primary" sticky="top" className="border-bottom" data-bs-theme="dark">
            <Container fluid className="flex-wrap px-3 px-sm-5">
                <Navbar.Brand as={NavLink} to="/home">
                    <img
                        src={logo}
                        alt="Logo"
                        width="30"
                        height="auto"
                        className="d-inline-block align-text-top me-3"
                    />
                    Egg CI
                </Navbar.Brand>
                <Nav className="order-3 order-sm-2 me-sm-auto navbar-nav--wrap">
                    <Nav.Link as={NavLink} to="/settings">
                        Settings
                    </Nav.Link>
                    {hasApiToken ? (
                        <Nav.Link as={NavLink} to="/projects">
                            Projects
                        </Nav.Link>
                    ) : (
                        <Nav.Link disabled>Projects</Nav.Link>
                    )}
                    {hasApiToken ? (
                        <Nav.Link as={NavLink} to="/workflows">
                            Workflows
                        </Nav.Link>
                    ) : (
                        <Nav.Link disabled>Workflows</Nav.Link>
                    )}
                </Nav>
                <Dropdown align="end" className="order-2 order-sm-3 me-2">
                    <Dropdown.Toggle
                        size="sm"
                        variant="outline-light"
                        id="profile-dropdown"
                        className="profile-toggle d-flex justify-content-between align-items-center"
                    >
                        <span>
                            <FontAwesomeIcon size="xl" className="me-2" icon={faUser} />
                            {activeProfile.name}
                        </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        {profiles.map((profile) => (
                            <Dropdown.Item
                                key={profile.id}
                                active={profile.id === activeProfile.id}
                                onClick={() => handleProfileSwitch(profile.id)}
                            >
                                {profile.name}
                            </Dropdown.Item>
                        ))}
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => navigate('/settings')}>Manage profiles</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                <a
                    className="nav-link github-link order-2 order-sm-4"
                    href="https://github.com/virgs/egg-ci"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on GitHub"
                >
                    <FontAwesomeIcon icon={faGithub} size="2xl" />
                </a>
                <a
                    className="nav-link coffee-link order-2 order-sm-5 mb-1"
                    href="https://buymeacoffee.com/virgs"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Buy me a coffee"
                >
                    <FontAwesomeIcon icon={faMugHot} size="2xl" />
                </a>
            </Container>
        </Navbar>
    )
}
