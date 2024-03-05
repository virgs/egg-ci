//https://circleci.com/docs/api/v2/index.html#operation/listPipelinesForProject


export type ListProjectPipelinesReponse = {
    next_page_token: string;
    items: ProjectPipeline[]
}

type ProjectPipeline = {
    id: string;
    errors: Error[];
    project_slug: string;
    updated_at: string;
    number: number;
    trigger_parameters: string;
    state: "created" | "errored" | "setup-pending" | "setup" | "pending";
    created_at: string;
    trigger: Trigger;
    vcs: Vcs;
};

type Error = {
    type: "config" | "config-fetch" | "timeout" | "permission" | "other" | "plan";
    message: string;
};

type Trigger = {
    type: "scheduled_pipeline" | "explicit" | "api" | "webhook";
    received_at: string;
    actor: {
        login: string;
        avatar_url: string;
    }
}

type Vcs = {
    provider_name: string;
    target_repository_url: string;
    branch: string;
    review_id: string;
    review_url: string;
    revision: string;
    tag: string;
    commit: {
        subject: string;
        body: string;
    };
    origin_repository_url: string;
};
