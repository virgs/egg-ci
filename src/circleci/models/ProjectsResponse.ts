import { Branch } from "./Branch";


export type ProjectsResponse = {
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
