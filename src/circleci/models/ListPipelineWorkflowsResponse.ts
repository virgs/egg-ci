export type ListPipelineWorkflowsResponse = {
    items: PipelineWorkflow[];
    next_page_token: string;
}

type PipelineWorkflow = {
    pipeline_id: string;
    canceled_by?: string;
    id: string;
    name: string;
    project_slug: string;
    errored_by?: string;
    tag?: string;
    status: "success" | "running" | "not_run" | "failed" | "error" | "failing" | "on_hold" | "canceled" | "unauthorized";
    started_by: string;
    pipeline_number: number;
    created_at: string;
    stopped_at: string;
}