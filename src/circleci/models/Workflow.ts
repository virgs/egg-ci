import { Status } from "./Status";


export type Workflow = {
    id: string;
    status: Status;
    created_at: string;
};
