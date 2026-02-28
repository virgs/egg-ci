import { faAnglesDown, faAnglesUp, faList, faSearch, faTableCellsLarge } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement } from 'react'
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
                    <div className="input-group input-group-sm">
                        <span className="input-group-text">
                            <FontAwesomeIcon icon={faSearch} />
                        </span>
                        <input
                            type="text"
                            value={filterText}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="form-control"
                            placeholder="Search by name..."
                            id="workflowSearchLabel"
                        />
                    </div>
                </div>
                <div className="col-12 col-xl-auto d-flex justify-content-end gap-2">
                    <div className="btn-group btn-group-sm">
                        <input
                            type="radio"
                            className="btn-check"
                            name="dashboard-view"
                            id="dashboard-view-grid"
                            checked={workflowView === 'grid'}
                            onChange={() => handleViewChange('grid')}
                        />
                        <label className="btn btn-outline-secondary" htmlFor="dashboard-view-grid" title="Grid view">
                            <FontAwesomeIcon icon={faTableCellsLarge} />
                        </label>
                        <input
                            type="radio"
                            className="btn-check"
                            name="dashboard-view"
                            id="dashboard-view-list"
                            checked={workflowView === 'list'}
                            onChange={() => handleViewChange('list')}
                        />
                        <label className="btn btn-outline-secondary" htmlFor="dashboard-view-list" title="List view">
                            <FontAwesomeIcon icon={faList} />
                        </label>
                    </div>
                    <button
                        className="btn btn-sm btn-outline-secondary"
                        title={allCollapsed ? 'Expand all' : 'Collapse all'}
                        onClick={onToggleAll}
                    >
                        <FontAwesomeIcon icon={allCollapsed ? faAnglesDown : faAnglesUp} />
                    </button>
                </div>
            </div>
        </>
    )
}
