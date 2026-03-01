import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useState } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import eggIcon from '/egg-icon.png'
import { useLoggedOutListener, useUserInformationChangedListener } from '../events/Events'
import { SettingsRepository } from '../settings/SettingsRepository'
import './NavBarComponent.scss'

const settingsRepository = new SettingsRepository()

export const NavBarComponent = (): ReactElement => {
    const [hasApiToken, setHasApiToken] = useState(() => !!settingsRepository.getApiToken())

    useUserInformationChangedListener(() => setHasApiToken(!!settingsRepository.getApiToken()))
    useLoggedOutListener(() => setHasApiToken(false))

    return (
        <Navbar expand bg="primary" sticky="top" className="border-bottom" data-bs-theme="dark">
            <Container fluid className="flex-wrap px-3 px-sm-5">
                <Navbar.Brand as={NavLink} to="/home">
                    <img
                        src={eggIcon}
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
                <a
                    className="nav-link github-link order-2 order-sm-3 ms-auto ms-sm-0"
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
