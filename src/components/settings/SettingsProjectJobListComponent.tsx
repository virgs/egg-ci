import { ReactElement } from 'react'
import { ProjectData } from '../../domain-models/models'
import { faScrewdriverWrench, faThumbsUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { UniqueJob, collectUniqueJobs } from './settingsProjectUtils'

type Props = {
    projectId: string
    projectData: ProjectData | undefined
    hiddenJobs: string[]
    onToggleJobVisibility: (jobName: string) => void
}

export const SettingsProjectJobListComponent = (props: Props): ReactElement => {
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
                <div key={name} className="form-check d-flex align-items-center gap-2">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={`job-vis-${props.projectId}-${name}`}
                        checked={!props.hiddenJobs.includes(name)}
                        onChange={() => props.onToggleJobVisibility(name)}
                    />
                    <label className="form-check-label flex-grow-1" htmlFor={`job-vis-${props.projectId}-${name}`}>
                        {index}. {name}
                    </label>
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
