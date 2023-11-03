import {
  changeWorkspaceReloadStatusSlice,
  deleteWorkspaceSlice,
} from "@/storage/redux/workspacesSlice";
import { userAPI } from "APIs";
import { Button, message } from "antd";
import { WorkspaceDto } from "models/workspaces";
import { useDispatch } from "react-redux";

type Props = {
  workspace: WorkspaceDto;
  setSelectedWorkspace: Function;
  setIsModalOpen: Function;
};
const DeleteWorkspaceWarning = ({
  workspace,
  setSelectedWorkspace,
  setIsModalOpen,
}: Props) => {
  const dispatch = useDispatch();
  const handleDelete = async () => {
    const res = await userAPI.deleteWorkspace(workspace.id);
    if (res) {
      message.success("Workspace deleted Successfully");
      dispatch(deleteWorkspaceSlice(workspace));
      setSelectedWorkspace(null);
      dispatch(changeWorkspaceReloadStatusSlice());
      setIsModalOpen(false);
    }
  };
  return (
    <>
      Do you want to delete the {workspace?.name} ?
      <div className="mx-auto mt-5 flex w-[300px] justify-between">
        <Button type="primary" onClick={() => handleDelete()}>
          Yes
        </Button>{" "}
        <Button type="primary" onClick={() => setIsModalOpen(false)}>
          No
        </Button>
      </div>
    </>
  );
};

export default DeleteWorkspaceWarning;
