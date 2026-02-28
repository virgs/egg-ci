import { ReactElement } from 'react'
import { Dropdown, Spinner } from 'react-bootstrap'
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

export const ProjectMenuComponent = (props: Props): ReactElement => {
    if (props.syncing) {
        return <Spinner animation="grow" size="sm" variant="secondary" />
    }

    const isDisabled = !props.project.enabled

    return (
        <Dropdown>
            <Dropdown.Toggle as="span" bsPrefix="project-menu">
                <FontAwesomeIcon icon={faBars} />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
                {props.relativeTime && (
                    <Dropdown.ItemText className="text-muted text-xs">
                        Updated {props.relativeTime}
                    </Dropdown.ItemText>
                )}
                <Dropdown.Item disabled={isDisabled} onClick={props.onRefresh}>
                    Refresh
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item disabled={isDisabled} onClick={props.onSelectAll}>
                    Select all
                </Dropdown.Item>
                <Dropdown.Item disabled={isDisabled} onClick={props.onUnselectAll}>
                    Unselect all
                </Dropdown.Item>
                <Dropdown.Item disabled={isDisabled} onClick={props.onSelectBuildJobs}>
                    Select build jobs
                </Dropdown.Item>
                <Dropdown.Item disabled={isDisabled} onClick={props.onSelectApprovalJobs}>
                    Select approval jobs
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item className="text-danger" disabled={!isDisabled} onClick={props.onExclude}>
                    Exclude project
                </Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>
    )
}
