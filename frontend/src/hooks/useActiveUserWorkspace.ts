import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

export const useActiveUserWorkspace = () => {
  const userInfo = useAppSelector((state: RootState) => state.userSlice.user);
  const activeWorkspace = useAppSelector(
    (state: RootState) => state.workspacesSlice.activeWorkspace
  );

  const activeUserWorkspace = activeWorkspace
    ? activeWorkspace.userWorkspaces?.find(
        (userWorkspace) => userWorkspace.userId === userInfo.id
      )
    : null;
  return activeUserWorkspace;
};
