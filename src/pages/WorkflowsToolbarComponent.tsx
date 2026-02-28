import { faAnglesDown, faAnglesUp, faList, faSearch, faTableCellsLarge } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement } from 'react'
import { Button, Form, InputGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { WorkflowView } from '../settings/SettingsRepository'
import { StatusFilterDropdown } from './StatusFilterDropdown'
import { useWorkflowsPage } from './WorkflowsPageContext'
import './WorkflowsToolbarComponent.scss'

type Props = {
    workflowCount: number
    allCollapsed: boolean
    onToggleAll: () => void
}

export const WorkflowsToolbarComponent = ({ workflowCount, allCollapsed, onToggleAll }: Props): ReactElement => {
    const { workflowView, filterText, handleViewChange, handleFilterChange } = useWorkflowsPage()

    return (
        <>
            <div className="d-flex align-items-center justify-content-between mb-2">
                <h3 className="mb-0">Workflows ({workflowCount})</h3>
            </div>
            <div className="row g-2 align-items-center mb-3">
                <div className="col-12 col-xl">
                    <InputGroup size="sm">
                        <InputGroup.Text>
                            <FontAwesomeIcon icon={faSearch} />
                        </InputGroup.Text>
                        <Form.Control
                            type="text"
                            value={filterText}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            placeholder="Search by name..."
                            id="workflowSearchLabel"
                        />
                    </InputGroup>
                </div>
                <div className="col-12 col-xl-auto d-flex justify-content-end gap-2">
                    <StatusFilterDropdown />
                    <ToggleButtonGroup
                        type="radio"
                        name="dashboard-view"
                        value={workflowView}
                        onChange={(v) => handleViewChange(v as WorkflowView)}
                        size="sm"
                    >
                        <ToggleButton
                            id="dashboard-view-grid"
                            value="grid"
                            variant="outline-secondary"
                            title="Grid view"
                        >
                            <FontAwesomeIcon icon={faTableCellsLarge} />
                        </ToggleButton>
                        <ToggleButton
                            id="dashboard-view-list"
                            value="list"
                            variant="outline-secondary"
                            title="List view"
                        >
                            <FontAwesomeIcon icon={faList} />
                        </ToggleButton>
                    </ToggleButtonGroup>
                    <Button
                        size="sm"
                        variant="outline-secondary"
                        title={allCollapsed ? 'Expand all' : 'Collapse all'}
                        onClick={onToggleAll}
                    >
                        <FontAwesomeIcon icon={allCollapsed ? faAnglesDown : faAnglesUp} />
                    </Button>
                </div>
            </div>
        </>
    )
}
