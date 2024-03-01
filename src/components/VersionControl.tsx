import { faGithub, faGitlab, faBitbucket } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export enum VersionControl {
    GITLAB,
    GITHUB,
    BITBUCKET,
    GITHUB_APP,
}

export const MapVersionControlFromString = (text: string): (VersionControl | undefined) => {
    switch (text.toLowerCase()) {
        case 'githubapp': return VersionControl.GITHUB_APP
        case 'github': return VersionControl.GITHUB
        case 'gitlab': return VersionControl.GITLAB
        case 'bitbucket': return VersionControl.BITBUCKET
    }
}

export class VersionControlComponent {
    private readonly versionControl: VersionControl;

    public constructor(versionControl: VersionControl) {
        this.versionControl = versionControl;
    }

    public getIcon(): JSX.Element {
        switch (this.versionControl) {
            case VersionControl.GITHUB_APP:
            case VersionControl.GITHUB:
                return <FontAwesomeIcon icon={faGithub} />
            case VersionControl.GITLAB:
                return <FontAwesomeIcon icon={faGitlab} />
            case VersionControl.BITBUCKET:
                return <FontAwesomeIcon icon={faBitbucket} />
        }
    }

    public getSlug(): string {
        switch (this.versionControl) {
            case VersionControl.GITLAB:
            case VersionControl.GITHUB_APP:
                return 'circleci'
            case VersionControl.GITHUB:
                return 'gh'
            case VersionControl.BITBUCKET:
                return 'bb'
        }
    }
}