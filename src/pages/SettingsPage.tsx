import { faCircleCheck, faInfoCircle, faRightToBracket } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement, useState } from 'react'
import { Button, Form, InputGroup, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { emitLoggedOut, emitNewNotification, emitUserInformationChanged } from '../events/Events'
import { circleCiClient, initializeCircleCiClient } from '../gateway/CircleCiClient'
import { UserInformationResponse } from '../gateway/models/UserInformationResponse'
import { ProjectService } from '../project/ProjectService'
import { SettingsRepository } from '../settings/SettingsRepository'
import './SettingsPage.scss'
import { useConfirmationModal } from '../components/useConfirmationModal.tsx'

const settingsRepository: SettingsRepository = new SettingsRepository()
const projectService: ProjectService = new ProjectService()

const tokenTooltipOverlay = (
    <Tooltip className="tooltip-wide">
        <h5 className="card-title my-1">CircleCI Personal API Token</h5>
        <ol className="mb-1 ps-3 text-start">
            <li>Click the icon to open CircleCI token settings</li>
            <li>Click <em>Create New Token</em></li>
            <li>Copy and paste the token here</li>
            <li>Make sure the projects are being followed in CircleCI (Projects &gt; Follow)</li>
        </ol>
        <em className="text-warning">Stored locally in your browser only — never shared.</em>
    </Tooltip>
)

export const SettingsPage = (): ReactElement => {
    const confirmationModal = useConfirmationModal()
    const [token, setToken] = useState<string>(() => settingsRepository.getApiToken() ?? '')
    const [hasSavedToken, setHasSavedToken] = useState<boolean>(() => !!settingsRepository.getApiToken())
    const [userInfo, setUserInfo] = useState<UserInformationResponse | undefined>(() =>
        settingsRepository.getUserInformation()
    )

    const connect = async () => {
        if (!token) return
        initializeCircleCiClient(token)
        try {
            const [newUserInformation, userProjects] = await Promise.all([
                circleCiClient.getUserInformation(),
                projectService.listUserProjects(),
            ])
            settingsRepository.setApiToken(token)
            settingsRepository.setUserInformation(newUserInformation)
            userProjects.forEach((project) => projectService.trackProject(project))
            emitUserInformationChanged(newUserInformation)
            setUserInfo(newUserInformation)
            setHasSavedToken(true)
            emitNewNotification({ message: 'Connected successfully' })
        } catch {
            emitNewNotification({ message: 'Invalid token' })
        }
    }

    const clearApiToken = () => {
        settingsRepository.clearApiToken()
        emitLoggedOut()
        setToken('')
        setUserInfo(undefined)
        setHasSavedToken(false)
    }

    const clearAllData = () => {
        emitLoggedOut()
        localStorage.clear()
        setToken('')
        setUserInfo(undefined)
        setHasSavedToken(false)
    }

    return (
        <div className="px-3">
            <h3>Settings</h3>
            <div className="mb-4">
                <InputGroup className="w-100 d-flex align-items-center mb-2">
                    <label htmlFor="circleci-api-token" className="form-label mb-0">
                        <span>API Token</span>
                        <OverlayTrigger
                            placement="right"
                            delay={{ show: 150, hide: 150 }}
                            overlay={tokenTooltipOverlay}
                        >
                            <a
                                className="ps-1 pe-3"
                                href="https://app.circleci.com/settings/user/tokens"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <FontAwesomeIcon className="align-baseline text-info-emphasis" icon={faInfoCircle} />
                            </a>
                        </OverlayTrigger>
                    </label>
                    <Form.Control
                        type="password"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        className="py-2"
                        id="circleci-api-token"
                        readOnly={hasSavedToken}
                    />
                    {!hasSavedToken && (
                        <Button disabled={!token} onClick={connect} variant="primary" className="py-2">
                            <FontAwesomeIcon icon={faRightToBracket} />
                        </Button>
                    )}
                </InputGroup>
            </div>
            {hasSavedToken && userInfo && (
                <div className="d-flex align-items-center gap-2 text-success mb-4">
                    <FontAwesomeIcon icon={faCircleCheck} />
                    <span>
                        Signed in as <strong>{userInfo.name}</strong>{' '}
                        <small className="text-muted">@{userInfo.login}</small>
                    </span>
                </div>
            )}
            <div className="d-grid gap-2">
                <Button
                    variant="outline-danger"
                    disabled={!hasSavedToken}
                    onClick={async () => {
                        const approved = await confirmationModal({
                            message:
                                'Are you sure you want to clear the API key? You will need to re-enter it to use the app.',
                        })
                        if (approved) {
                            clearApiToken()
                        }
                    }}
                >
                    Clear API key
                </Button>
                <Button
                    variant="danger"
                    disabled={!hasSavedToken}
                    onClick={async () => {
                        const approved = await confirmationModal({
                            message: 'Are you sure you want to clear all data? This action cannot be undone',
                        })
                        if (approved) {
                            clearAllData()
                        }
                    }}
                >
                    Clear all data
                </Button>
            </div>
        </div>
    )
}
