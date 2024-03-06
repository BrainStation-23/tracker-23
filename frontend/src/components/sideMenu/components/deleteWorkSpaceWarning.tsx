import { message } from "antd";
import { userAPI } from "APIs";
import { WorkspaceDto } from "models/workspaces";
import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import { deleteWorkspaceSlice } from "@/storage/redux/workspacesSlice";

type Props = {
  workspace: WorkspaceDto;
  setSelectedWorkspace: Function;
  setIsModalOpen: Function;
};
const DeleteWorkspaceWarning = ({ workspace, setIsModalOpen }: Props) => {
  const dispatch = useDispatch();
  const handleDelete = async () => {
    const res = await userAPI.deleteWorkspace(workspace.id);
    if (res) {
      message.success("Workspace deleted Successfully");
      dispatch(deleteWorkspaceSlice(workspace));
      setIsModalOpen(false);
    }
  };
  return (
    <>
      Do you want to delete the{" "}
      <span className="font-bold">{workspace?.name}</span> ?
      <div className="mx-auto mt-8 flex w-[200px] justify-between px-5">
        <PrimaryButton onClick={handleDelete}>Yes</PrimaryButton>
        <PrimaryButton onClick={() => setIsModalOpen(false)}>No</PrimaryButton>
      </div>
    </>
  );
};

export default DeleteWorkspaceWarning;
