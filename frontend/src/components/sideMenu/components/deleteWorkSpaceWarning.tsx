import { WorkspaceDto } from "models/workspaces";

type Props = {
    workspace: WorkspaceDto;
    setSelectedWorkspace: Function;
};
const DeleteWorkspaceWarning = ({ workspace, setSelectedWorkspace }: Props) => {
    return <>Do you want to delete the {workspace?.name } ?</>;
};

export default DeleteWorkspaceWarning;
