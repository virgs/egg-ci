import { faGithub, faGitlab, faBitbucket } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VersionControlType } from "../version-control/VersionControl";

export class VersionControlComponent {
    private readonly versionControl: VersionControlType;

    public constructor(versionControl: VersionControlType) {
        this.versionControl = versionControl;
    }

    public getIcon(): JSX.Element {
        switch (this.versionControl) {
            case VersionControlType.GITHUB_APP:
            case VersionControlType.GITHUB:
                return <FontAwesomeIcon icon={faGithub} />
            case VersionControlType.GITLAB:
                return <FontAwesomeIcon icon={faGitlab} />
            case VersionControlType.BITBUCKET:
                return <FontAwesomeIcon icon={faBitbucket} />
        }
    }

}