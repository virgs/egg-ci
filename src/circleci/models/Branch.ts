import { Build } from "./Build";
import { Workflow } from "./Workflow";


export type Branch = {
    running_builds: Build[];
    recent_builds: Build[];
    is_using_workflows: boolean;
    pusher_logins: string[];
    last_success: Build;
    last_non_success: Build;
    latest_workflows: {
        merge_workflow: Workflow;
        pipeline_workflow: Workflow;
    };
    latest_completed_workflows: {
        merge_workflow: Workflow;
        pipeline_workflow: Workflow;
    };
};
