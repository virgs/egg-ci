import { faAnglesDown, faAnglesUp, faList, faSearch, faTableCellsLarge } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement } from 'react'
import { Button, Form, InputGroup } from 'react-bootstrap'
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
                    <div className="btn-group btn-group-sm">
                        <Button
                            variant={workflowView === 'grid' ? 'secondary' : 'outline-secondary'}
                            onClick={() => handleViewChange('grid')}
                        >
                            <FontAwesomeIcon icon={faTableCellsLarge} />
                        </Button>
                        <Button
                            variant={workflowView === 'list' ? 'secondary' : 'outline-secondary'}
                            onClick={() => handleViewChange('list')}
                        >
                            <FontAwesomeIcon icon={faList} />
                        </Button>
                    </div>
                    <Button size="sm" variant="outline-secondary" onClick={onToggleAll}>
                        <FontAwesomeIcon icon={allCollapsed ? faAnglesDown : faAnglesUp} />
                    </Button>
                </div>
            </div>
        </>
    )
}
