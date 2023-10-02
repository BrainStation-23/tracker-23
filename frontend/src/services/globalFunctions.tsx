import { UserDto } from "models/user";
import { WorkspaceDto } from "models/workspaces";

export const getActiveUserWorSpace = (
  allWorkspaces: WorkspaceDto[],
  userInfo: UserDto
) => {
  const activeWorkspace = allWorkspaces
    ? allWorkspaces.find(
        (workSpace) => workSpace.id === userInfo.activeWorkspaceId
      )
    : null;

  const activeUserWorkspace = activeWorkspace
    ? activeWorkspace.userWorkspaces?.find(
        (userWorkspace) => userWorkspace.userId === userInfo.id
      )
    : null;
  return activeUserWorkspace;
};
