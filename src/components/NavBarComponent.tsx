import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement } from 'react'
import { Container, Nav, Navbar } from 'react-bootstrap'
import { NavLink } from 'react-router-dom'
import eggIcon from '/egg-icon.png'
import './NavBarComponent.scss'

export const NavBarComponent = (): ReactElement => {
    return (
        <Navbar expand bg="primary" sticky="top" className="border-bottom" data-bs-theme="dark">
            <Container fluid className="px-5">
                <Navbar.Brand>
                    <img
                        src={eggIcon}
                        alt="Logo"
                        width="30"
                        height="auto"
                        className="d-inline-block align-text-top me-3"
                    />
                    Egg CI
                </Navbar.Brand>
                <Nav className="me-auto">
                    <Nav.Link as={NavLink} to="/settings">Settings</Nav.Link>
                    <Nav.Link as={NavLink} to="/projects">Projects</Nav.Link>
                    <Nav.Link as={NavLink} to="/workflows">Workflows</Nav.Link>
                </Nav>
                <a
                    className="nav-link ms-auto github-link"
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
