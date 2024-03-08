import { IconDefinition, faCheck, faPause, faPlay, faRotate, faXmark } from "@fortawesome/free-solid-svg-icons";
import { WorkflowJob } from "../gateway/models/ListWorkflowJobsResponse";

type Result = {
    color: string;
    animated: boolean;
    actionIcon: IconDefinition
};

export const getClassesFromJobExecution = (job: WorkflowJob): Result => {
    switch (job.status) {
        case 'success':
            return { color: 'success', animated: false, actionIcon: faCheck };
        case 'running':
            return { color: 'warning', animated: true, actionIcon: faRotate };

        case 'on_hold':
        case 'blocked':
        case 'queued':
        case 'retried':
            return { color: 'info', animated: true, actionIcon: faPause };

        case 'terminated-unknown':
        case 'canceled':
        case 'failed':
        case 'not_running':
        case 'infrastructure_fail':
        case 'timedout':
        case 'not_run':
        case 'unauthorized':
            return { color: 'danger', animated: false, actionIcon: faXmark };
    }
};
