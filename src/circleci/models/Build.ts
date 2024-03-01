import { Status } from "./Status";


export type Build = {
    status: Status;
    outcome: Status;
    build_num: number;
    vcs_revision: string;
    pushed_at: string;
    added_at: string;
    is_workflow_job: boolean;
    is_2_0_job: boolean;
};
