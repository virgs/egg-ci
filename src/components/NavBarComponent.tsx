import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useState } from 'react'
import { Container, Nav, Navbar, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import logo from '/logo.png'
import { useLoggedOutListener, useUserInformationChangedListener } from '../events/Events'
import { SettingsRepository } from '../settings/SettingsRepository'
import { Theme, applyTheme } from '../theme/ThemeManager'
import './NavBarComponent.scss'

const settingsRepository = new SettingsRepository()

export const NavBarComponent = (): ReactElement => {
    const [hasApiToken, setHasApiToken] = useState(() => !!settingsRepository.getApiToken())
    const [theme, setTheme] = useState<Theme>(() => settingsRepository.getTheme())

    useUserInformationChangedListener(() => setHasApiToken(!!settingsRepository.getApiToken()))
    useLoggedOutListener(() => setHasApiToken(false))

    const toggleTheme = () => {
        const next: Theme = theme === 'light' ? 'dark' : 'light'
        settingsRepository.setTheme(next)
        applyTheme(next)
        setTheme(next)
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
                    <Nav.Link as={NavLink} to="/settings">Settings</Nav.Link>
                    {hasApiToken
                        ? <Nav.Link as={NavLink} to="/projects">Projects</Nav.Link>
                        : <Nav.Link disabled>Projects</Nav.Link>}
                    {hasApiToken
                        ? <Nav.Link as={NavLink} to="/workflows">Workflows</Nav.Link>
                        : <Nav.Link disabled>Workflows</Nav.Link>}
                </Nav>
                <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip>{theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}</Tooltip>}
                >
                    <button
                        className="nav-link theme-toggle order-2 order-sm-3 ms-auto ms-sm-0"
                        onClick={toggleTheme}
                        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                    >
                        <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} size="xl" />
                    </button>
                </OverlayTrigger>
                <a
                    className="nav-link github-link order-2 order-sm-4"
                    href="https://github.com/virgs/egg-ci"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on GitHub"
                >
                    <FontAwesomeIcon icon={faGithub} size="2xl" />
                </a>
            </Container>
        </Navbar>
    )
}
