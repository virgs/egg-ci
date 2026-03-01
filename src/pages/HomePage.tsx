import DOMPurify from 'dompurify'
import { faBarsProgress, faFolderTree, faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { marked } from 'marked'
import { ReactElement, useState } from 'react'
import { Alert, Card } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import readmeContent from '../../README.md?raw'
import logoUrl from '/logo.png'
import { useLoggedOutListener, useUserInformationChangedListener } from '../events/Events'
import { SettingsRepository } from '../settings/SettingsRepository'
import './HomePage.scss'

const settingsRepository = new SettingsRepository()
const PLACEHOLDER = '[//]: # (homepage placeholder)'
const parseMarkdown = (md: string): string =>
    DOMPurify.sanitize(marked.parse(md.replace('./public/logo.png', logoUrl)) as string)

const [beforeMd, afterMd] = readmeContent.split(PLACEHOLDER)
const beforeHtml = parseMarkdown(beforeMd ?? '')
const afterHtml = parseMarkdown(afterMd ?? '')

const homePageCards = [
    {
        icon: faGear,
        title: 'Settings',
        description:
            "Before anything else, you'll need to drop in your CircleCI API token. It stays local, never phones home, and unlocks everything else on this page.",
        to: '/settings',
        variant: 'outline-secondary' as const,
        requiresKey: false,
    },
    {
        icon: faFolderTree,
        title: 'Projects',
        description:
            "Pick the repositories you actually care about. Add them, flip the enable switch, and they'll start showing up in your dashboard.",
        to: '/projects',
        variant: 'outline-secondary' as const,
        requiresKey: true,
    },
    {
        icon: faBarsProgress,
        title: 'Workflows',
        description:
            'The main event. Every tracked project, workflow, and job — with a color-coded history of the last few runs. Leave it open on that spare monitor and feel very productive.',
        to: '/workflows',
        variant: 'outline-primary' as const,
        requiresKey: true,
    },
]

export const HomePage = (): ReactElement => {
    const [hasApiToken, setHasApiToken] = useState(() => !!settingsRepository.getApiToken())

    useUserInformationChangedListener(() => setHasApiToken(!!settingsRepository.getApiToken()))
    useLoggedOutListener(() => setHasApiToken(false))

    return (
        <div className="homepage-content">
            {!hasApiToken && (
                <Alert variant="info" className="mb-3">
                    New here? Head to <Link to="/settings">Settings</Link> first to add your CircleCI API token.
                    Everything else unlocks from there.
                </Alert>
            )}
            <div className="readme-content" dangerouslySetInnerHTML={{ __html: beforeHtml }} />
            <div className="row g-3 mb-4">
                {homePageCards.map(({ icon, title, description, to, variant, requiresKey }) => {
                    const disabled = requiresKey && !hasApiToken
                    return (
                        <div key={to} className="col-md-4">
                            <Card className={`page-card h-100${disabled ? ' opacity-50' : ''}`}>
                                <Card.Body className="d-flex flex-column gap-2">
                                    <Card.Title>
                                        <FontAwesomeIcon className="me-2" icon={icon} />
                                        {title}
                                    </Card.Title>
                                    <Card.Text className="flex-grow-1">{description}</Card.Text>
                                    <div>
                                        <Link
                                            to={to}
                                            className={`btn btn-sm btn-${variant}${disabled ? ' disabled' : ''}`}
                                            aria-disabled={disabled}
                                        >
                                            Go to {title} →
                                        </Link>
                                    </div>
                                </Card.Body>
                            </Card>
                        </div>
                    )
                })}
            </div>
            <div className="readme-content" dangerouslySetInnerHTML={{ __html: afterHtml }} />
        </div>
    )
}
