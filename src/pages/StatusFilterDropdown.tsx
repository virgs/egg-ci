import { faFilter } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ReactElement } from 'react'
import { Badge, Button, Dropdown, Form } from 'react-bootstrap'
import { WorkflowJobStatus } from '../gateway/models/ListWorkflowJobsResponse'
import { useWorkflowsPage } from './WorkflowsPageContext'
import { ALL_JOB_STATUSES } from './statusFilterUtils'
import './StatusFilterDropdown.scss'

export const StatusFilterDropdown = (): ReactElement => {
    const { statusFilters, handleStatusFiltersChange } = useWorkflowsPage()

    const excludedCount = ALL_JOB_STATUSES.length - statusFilters.length

    const toggleStatus = (status: WorkflowJobStatus): void => {
        if (statusFilters.includes(status)) {
            handleStatusFiltersChange(statusFilters.filter((s) => s !== status))
        } else {
            handleStatusFiltersChange([...statusFilters, status])
        }
    }

    return (
        <Dropdown autoClose="outside">
            <Dropdown.Toggle size="sm" variant="outline-secondary" id="status-filter-toggle">
                <FontAwesomeIcon icon={faFilter} />
                <Badge bg="primary" pill className="ms-1">
                    {excludedCount}
                </Badge>
            </Dropdown.Toggle>
            <Dropdown.Menu className="status-filter-menu p-2">
                <Button
                    size="sm"
                    variant="link"
                    className="p-0 mb-1 text-decoration-none"
                    disabled={statusFilters.length === 0}
                    onClick={() => handleStatusFiltersChange([])}
                >
                    Clear all
                </Button>
                <Dropdown.Divider />
                {ALL_JOB_STATUSES.map((status) => (
                    <Form.Check
                        key={status}
                        id={`status-filter-${status}`}
                        checked={statusFilters.includes(status)}
                        onChange={() => toggleStatus(status)}
                        label={status.replace(/[_-]/g, ' ')}
                        className="status-filter-item"
                    />
                ))}
            </Dropdown.Menu>
        </Dropdown>
    )
}
