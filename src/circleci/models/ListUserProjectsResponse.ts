export type ListUserProjectsResponse = {
    branches: {
        [branchName: string]: Branch;
    };
    oss: boolean;
    reponame: string;
    username: string;
    has_usable_key: boolean;
    vcs_type: string;
    language?: null;
    vcs_url: string;
    following: boolean;
    default_branch: string;
};

type ProjectWorkflow = {
    id: string;
    status: "failed" | "success";
    created_at: string;
};

type Build = {
    status: "failed" | "success";
    outcome: "failed" | "success";
    build_num: number;
    vcs_revision: string;
    pushed_at: string;
    added_at: string;
    is_workflow_job: boolean;
    is_2_0_job: boolean;
};

type Branch = {
    running_builds: Build[];
    recent_builds: Build[];
    is_using_workflows: boolean;
    pusher_logins: string[];
    last_success: Build;
    last_non_success: Build;
    latest_workflows: {
        merge_workflow: ProjectWorkflow;
        pipeline_workflow: ProjectWorkflow;
    };
    latest_completed_workflows: {
        merge_workflow: ProjectWorkflow;
        pipeline_workflow: ProjectWorkflow;
    };
};
