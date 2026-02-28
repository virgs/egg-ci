import { ReactElement } from 'react'
import { Form } from 'react-bootstrap'
import { ProjectData } from '../../domain-models/models'
import { faScrewdriverWrench, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { UniqueJob, collectUniqueJobs } from './projectUtils'

type Props = {
    projectId: string
    projectData: ProjectData | undefined
    hiddenJobs: string[]
    onToggleJobVisibility: (jobName: string) => void
}

export const ProjectJobListComponent = (props: Props): ReactElement => {
    if (!props.projectData) {
        return (
            <p className="text-muted fst-italic mb-0">
                No data yet. Enable and sync the project first.
            </p>
        )
    }

    const allJobs = collectUniqueJobs(props.projectData)
    if (allJobs.length === 0) {
        return <p className="text-muted fst-italic mb-0">No jobs found for this project.</p>
    }

    return (
        <>
            {allJobs.map(({ name, type }: UniqueJob, index: number) => (
                <div key={name} className="d-flex align-items-center gap-2">
                    <Form.Check
                        id={`job-vis-${props.projectId}-${name}`}
                        checked={!props.hiddenJobs.includes(name)}
                        onChange={() => props.onToggleJobVisibility(name)}
                        label={`${index}. ${name}`}
                        className="flex-grow-1"
                    />
                    {type === 'build' ? (
                        <FontAwesomeIcon className="me-2 text-primary" icon={faScrewdriverWrench} />
                    ) : (
                        <FontAwesomeIcon className="me-2 text-info" icon={faThumbsUp} />
                    )}
                </div>
            ))}
        </>
    )
}
