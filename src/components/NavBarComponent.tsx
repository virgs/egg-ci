import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement } from 'react'
import { NavLink } from 'react-router-dom'
import eggIcon from '/egg-icon.png'
import './NavBarComponent.scss'

const navLinkClass = ({ isActive }: { isActive: boolean }) => `nav-link${isActive ? ' active' : ''}`

export const NavBarComponent = (): ReactElement => {
    return (
        <nav className="navbar navbar-expand sticky-top border-bottom bg-primary" data-bs-theme="dark">
            <div className="container-fluid px-5">
                <span className="navbar-brand">
                    <img
                        src={eggIcon}
                        alt="Logo"
                        width="30"
                        height="auto"
                        className="d-inline-block align-text-top me-3"
                    />
                    Egg CI
                </span>
                <div className="navbar-nav me-auto">
                    <NavLink to="/settings" className={navLinkClass}>Settings</NavLink>
                    <NavLink to="/projects" className={navLinkClass}>Projects</NavLink>
                    <NavLink to="/workflows" className={navLinkClass}>Workflows</NavLink>
                </div>
                <a
                    className="nav-link ms-auto github-link"
                    href="https://github.com/virgs/egg-ci"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on GitHub"
                >
                    <FontAwesomeIcon icon={faGithub} size="2xl" />
                </a>
            </div>
        </nav>
    )
}
