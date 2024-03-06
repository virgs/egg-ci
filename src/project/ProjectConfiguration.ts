export interface ProjectConfiguration {
    enabled: boolean;
    vcsType: string;
    reponame: string;
    username: string;
    defaultBranch: string;
    workflows: string[]
}
