export enum VersionControlType {
    GITLAB,
    GITHUB,
    BITBUCKET,
    GITHUB_APP
}

export const mapVersionControlFromString = (text: string): (VersionControlType | undefined) => {
    switch (text.toLowerCase()) {
        case 'githubapp': return VersionControlType.GITHUB_APP
        case 'github': return VersionControlType.GITHUB
        case 'gitlab': return VersionControlType.GITLAB
        case 'bitbucket': return VersionControlType.BITBUCKET
    }
}

export const getVersionControlSlug = (type: VersionControlType): string => {
    switch (type) {
        case VersionControlType.GITLAB:
        case VersionControlType.GITHUB_APP:
            return 'circleci'
        case VersionControlType.GITHUB:
            return 'gh'
        case VersionControlType.BITBUCKET:
            return 'bb'
    }
}