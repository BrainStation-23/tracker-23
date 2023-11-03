import {
  Avatar,
  Button,
  Dropdown,
  MenuProps,
  message,
  Spin,
  Typography,
} from "antd";
import { userAPI } from "APIs";
import { WorkspaceDto } from "models/workspaces";
import { useState } from "react";
import { useDispatch } from "react-redux";

import GlobalModal from "@/components/modals/globalModal";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { changeWorkspaceReloadStatusSlice } from "@/storage/redux/workspacesSlice";
import {
  CloseCircleOutlined,
  EditOutlined,
  RightCircleOutlined,
} from "@ant-design/icons";

import AddNewWorkspace from "./addNewWorkspace";
import DeleteWorkspaceWarning from "./deleteWorkSpaceWarning";
import EditWorkspace from "./editWorkspace";

const { Text } = Typography;
const WorkspaceSelection = () => {
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoadingWorkspace, setIsModalLoadingWorkspace] = useState(false);
  const [mode, setMode] = useState(0);
  const workspacesList = useAppSelector(
    (state: RootState) => state.workspacesSlice.workspaces
  );

  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceDto | null>();
  const activeWorkspace = useAppSelector(
    (state: RootState) => state.workspacesSlice.activeWorkspace
  );

  const handleChangeWorkspaceClick = async (workspace: WorkspaceDto) => {
    const res = await userAPI.changeWorkspace(workspace.id);
    message.success("Active Workspace Changed");
    dispatch(changeWorkspaceReloadStatusSlice());
  };
  const handleWorkspaceDeleteClick = async (workspace: WorkspaceDto) => {
    setMode(2);
    const res = await userAPI.deleteWorkspace(workspace.id);
    setSelectedWorkspace(workspace);
    setIsModalOpen(true);
  };
  const handleWorkspaceEditClick = async (workspace: WorkspaceDto) => {
    setSelectedWorkspace({ ...workspace });
    setMode(1);
    setIsModalOpen(true);
  };

  const filteredWorkspaces = workspacesList.filter(
    (workspace) => workspace !== activeWorkspace
  );
  const items: MenuProps["items"] = workspacesList
    .filter((workspace) => activeWorkspace.id != workspace.id)
    .map((workspace) => {
      return {
        key: `${workspace.id}`,
        icon: (
          <>
            {workspace.picture ? (
              workspace.picture
            ) : (
              <Avatar size={"small"}>{workspace.name[0]}</Avatar>
            )}
          </>
        ),
        label: (
          <div className="ml-2 flex  items-center justify-between">
            <div>{workspace.name} </div>
            <div className="flex items-center justify-between gap-3">
              <EditOutlined
                className="hover:text-red-500"
                onClick={() => {
                  handleWorkspaceEditClick(workspace);
                }}
              />
              <CloseCircleOutlined
                className="hover:text-red-500"
                onClick={() => {
                  handleWorkspaceDeleteClick(workspace);
                }}
              />
              <RightCircleOutlined
                className="hover:text-green-500"
                onClick={() => {
                  handleChangeWorkspaceClick(workspace);
                }}
              />
            </div>
          </div>
        ),
      };
    });

  items.push({
    key: Math.random(),
    icon: <Avatar size={"small"}>+</Avatar>,
    label: <div className="ml-2">Add new</div>,
    onClick: () => {
      setMode(0);
      setIsModalOpen(true);
    },
  });
  console.log("🚀 ~ file: workspaceSection.tsx:30 ~  ~ items:", items);

  const dropdownRender = (menu: React.ReactNode) => (
    <div className="float-right  w-[240px]">{menu}</div>
  );

  return (
    <>
      <Dropdown
        menu={{ items }}
        trigger={["click"]}
        placement="topRight"
        arrow
        dropdownRender={dropdownRender}
        className=" w-[250px]"
      >
        <Button className="h-max w-[240px]">
          <div className="grid grid-cols-12 gap-2 py-2">
            <Avatar className="col-span-2" size={"small"}>
              {activeWorkspace?.name?.length > 0
                ? activeWorkspace?.name[0]
                : ""}
            </Avatar>
            <div className="col-span-10">
              <Text className="" ellipsis={{ tooltip: activeWorkspace?.name }}>
                {activeWorkspace?.name}
              </Text>
            </div>
          </div>
        </Button>
      </Dropdown>
      <GlobalModal
        {...{ isModalOpen, setIsModalOpen, title: "Create Workspace" }}
      >
        <Spin spinning={isModalLoadingWorkspace}>
          {mode === 1 ? (
            <EditWorkspace
              workspace={selectedWorkspace}
              setSelectedWorkspace={setSelectedWorkspace}
              setIsModalOpen={setIsModalOpen}
            />
          ) : mode === 2 ? (
            <DeleteWorkspaceWarning
              workspace={selectedWorkspace}
              setSelectedWorkspace={setSelectedWorkspace}
              setIsModalOpen={setIsModalOpen}
            />
          ) : (
            <AddNewWorkspace
              setIsModalOpen={setIsModalOpen}
              setIsModalLoading={setIsModalLoadingWorkspace}
            />
          )}
        </Spin>
      </GlobalModal>
    </>
    // <>
    //   {items?.length > 1 ? (
    //     <Dropdown
    //       menu={{ items }}
    //       trigger={["click"]}
    //       placement="topRight"
    //       arrow
    //       dropdownRender={dropdownRender}
    //     >
    //       <Button className="h-max">
    //         <div className="flex items-center gap-2 p-2">
    //           <Avatar size={"small"}>{activeWorkspace?.name[0]}</Avatar>
    //           {activeWorkspace?.name}
    //         </div>
    //       </Button>
    //     </Dropdown>
    //   ) : (
    //     <Button className="h-max">
    //       <div className="flex items-center gap-2 p-2">
    //         <Avatar size={"small"}>{activeWorkspace?.name[0]}</Avatar>
    //         {activeWorkspace?.name}
    //       </div>
    //     </Button>
    //   )}
    // </>
  );
};

export default WorkspaceSelection;
