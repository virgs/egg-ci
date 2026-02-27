import { ReactElement } from 'react'
import { ProjectData, TrackedProjectData } from '../../domain-models/models'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type Props = {
    project: TrackedProjectData
    syncing: boolean
    relativeTime: string | undefined
    projectData: ProjectData | undefined
    onRefresh: () => void
    onSelectAll: () => void
    onUnselectAll: () => void
    onSelectBuildJobs: () => void
    onSelectApprovalJobs: () => void
    onExclude: () => void
}

export const SettingsProjectMenuComponent = (props: Props): ReactElement => {
    if (props.syncing) {
        return (
            <div className="spinner-grow spinner-grow-sm text-secondary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        )
    }

    const isDisabled = !props.project.enabled

    return (
        <div className="dropdown">
            <FontAwesomeIcon icon={faBars} data-bs-toggle="dropdown" aria-expanded="false" />
            <ul className="dropdown-menu dropdown-menu-end">
                {props.relativeTime && (
                    <li>
                        <span className="dropdown-item-text text-muted text-xs">
                            Updated {props.relativeTime}
                        </span>
                    </li>
                )}
                <li>
                    <button className="dropdown-item" type="button" disabled={isDisabled} onClick={props.onRefresh}>
                        Refresh
                    </button>
                </li>
                <li>
                    <hr className="dropdown-divider" />
                </li>
                <li>
                    <button className="dropdown-item" type="button" disabled={isDisabled} onClick={props.onSelectAll}>
                        Select all
                    </button>
                </li>
                <li>
                    <button className="dropdown-item" type="button" disabled={isDisabled} onClick={props.onUnselectAll}>
                        Unselect all
                    </button>
                </li>
                <li>
                    <button
                        className="dropdown-item"
                        type="button"
                        disabled={isDisabled}
                        onClick={props.onSelectBuildJobs}
                    >
                        Select build jobs
                    </button>
                </li>
                <li>
                    <button
                        className="dropdown-item"
                        type="button"
                        disabled={isDisabled}
                        onClick={props.onSelectApprovalJobs}
                    >
                        Select approval jobs
                    </button>
                </li>
                <li>
                    <hr className="dropdown-divider" />
                </li>
                <li>
                    <button
                        className="dropdown-item text-danger"
                        type="button"
                        disabled={!isDisabled}
                        onClick={props.onExclude}
                    >
                        Exclude project
                    </button>
                </li>
            </ul>
        </div>
    )
}
