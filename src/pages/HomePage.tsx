import DOMPurify from 'dompurify'
import { faBarsProgress, faFolderTree, faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { marked } from 'marked'
import { ReactElement, useState } from 'react'
import { Alert, Card, Image, Modal } from 'react-bootstrap'
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
        variant: 'outline-primary' as const,
        requiresKey: false,
        screenshot: `${import.meta.env.BASE_URL}/screenshots/settings-page.png`,
        features: ["One API token and you're in. Stored locally, never shared."],
    },
    {
        icon: faFolderTree,
        title: 'Projects',
        description:
            "Pick the repositories you actually care about. Add them, flip the enable switch, and they'll start showing up in your dashboard.",
        to: '/projects',
        variant: 'outline-primary' as const,
        requiresKey: true,
        screenshot: `${import.meta.env.BASE_URL}/screenshots/projects-page.png`,
        features: [
            'Every followed project, showing only the jobs you care about.',
            'Hide the ones cluttering your view.',
            'Drag them into whatever order makes sense.',
        ],
    },
    {
        icon: faBarsProgress,
        title: 'Workflows',
        description:
            'The main event. Every tracked project, workflow, and job — with a color-coded history of the last few runs. Leave it open on that spare monitor and feel very productive.',
        to: '/workflows',
        variant: 'outline-primary' as const,
        requiresKey: true,
        screenshot: `${import.meta.env.BASE_URL}/screenshots/workflows-page.png`,
        features: [
            "Each job's last few runs, color-coded at a glance.",
            'Rerun, approve, or cancel any job right from the card.',
            'Search by name or filter by status — nothing gets buried.',
        ],
    },
]

export const HomePage = (): ReactElement => {
    const [hasApiToken, setHasApiToken] = useState(() => !!settingsRepository.getApiToken())
    const [lightbox, setLightbox] = useState<{ url: string; title: string } | null>(null)

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
            <div className="readme-content mt-3" dangerouslySetInnerHTML={{ __html: beforeHtml }} />
            <div className="row g-3 mb-4">
                {homePageCards.map(({ icon, title, description, to, variant, requiresKey, screenshot, features }) => {
                    const disabled = requiresKey && !hasApiToken
                    return (
                        <div key={to} className="col-md-4">
                            <Card className={`page-card h-100`}>
                                <Card.Body className="d-flex flex-column gap-2">
                                    <Card.Title>
                                        <FontAwesomeIcon className="me-2" icon={icon} />
                                        {title}
                                    </Card.Title>
                                    <div className="screenshot-container" onClick={() => setLightbox({ url: screenshot, title })}>
                                        <Image
                                            src={screenshot}
                                            alt={`${title} page preview`}
                                            className="screenshot-thumbnail"
                                        />
                                    </div>
                                    <ul className="screenshot-features">
                                        {features.map((f) => <li key={f}>{f}</li>)}
                                    </ul>
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
            <Modal show={!!lightbox} onHide={() => setLightbox(null)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>{lightbox?.title} page</Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <img src={lightbox?.url ?? ''} alt={`${lightbox?.title ?? ''} screenshot`} className="w-100" />
                </Modal.Body>
            </Modal>
        </div>
    )
}
