import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  MenuProps,
  message,
  Radio,
  Spin,
  theme,
  Typography,
} from "antd";
import { userAPI } from "APIs";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import { LuMoreHorizontal, LuPenLine, LuTrash2 } from "react-icons/lu";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

import { useActiveUserWorkspace } from "@/hooks/useActiveUserWorkspace";

import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { setSyncRunning, setSyncStatus } from "@/storage/redux/syncSlice";
import { changeWorkspaceReloadStatusSlice } from "@/storage/redux/workspacesSlice";

import EditWorkspace from "./editWorkspace";
import AddNewWorkspace from "./addNewWorkspace";
import { WorkspaceDto } from "models/workspaces";
import GlobalModal from "@/components/modals/globalModal";
import LogOutButton from "@/components/logout/logOutButton";
import DeleteWorkspaceWarning from "./deleteWorkSpaceWarning";
import SyncButtonComponent from "@/components/common/buttons/syncButton";

const { Text } = Typography;

const modalTitles = [
  "Create Workspace",
  "Update Workspace",
  "Delete Workspace",
];

const WorkspaceNav = () => {
  const dispatch = useDispatch();
  const activeUserWorkspace = useActiveUserWorkspace();

  const [mode, setMode] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [workspaceInMoreMode, setWorkspaceInMoreMode] = useState(null);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceDto | null>();

  const workspaces = useAppSelector(
    (state: RootState) => state.workspacesSlice.workspaces
  );
  const activeWorkspace = useAppSelector(
    (state: RootState) => state.workspacesSlice.activeWorkspace
  );

  const handleChangeWorkspaceClick = async (workspace: WorkspaceDto) => {
    if (activeWorkspace?.id !== workspace.id) {
      const response = await userAPI.changeWorkspace(workspace.id);
      if (response) {
        message.success("Active Workspace Changed");
        dispatch(changeWorkspaceReloadStatusSlice());
      }
    }
    setDropdownOpen(false);
  };

  const handleWorkspaceDeleteClick = async (workspace: WorkspaceDto) => {
    setMode(2);
    setSelectedWorkspace(workspace);
    setIsModalOpen(true);
  };

  const menuItems: MenuProps["items"] = [];
  const syncFunction = async () => {
    dispatch(setSyncRunning(true));
    const response = await userAPI.syncTasks();
    if (response) {
      dispatch(setSyncStatus(response));
    }
  };

  const { useToken } = theme;
  const { token } = useToken();

  const contentStyle = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };

  const dropdownRender = () => (
    <div style={contentStyle} className="py-4 font-semibold">
      <div className="mx-4">
        <Radio.Group
          className="max-h-[500px] w-full overflow-y-auto"
          defaultValue={activeWorkspace?.id}
          value={activeWorkspace?.id}
        >
          <div className="flex w-full flex-col gap-0 ">
            {workspaces?.map((workspace) => (
              <div
                key={workspace.id}
                className={`flex w-[280px] items-center gap-2 rounded p-1 pr-0 hover:bg-neutral-100 ${
                  activeWorkspace?.id === workspace.id ? "bg-neutral-100" : ""
                }`}
              >
                <Radio
                  value={workspace.id}
                  className="text-primary"
                  onClick={() => handleChangeWorkspaceClick(workspace)}
                >
                  <div className="flex gap-3">
                    <div className="flex w-fit cursor-pointer items-center gap-2 rounded">
                      <Avatar
                        className="col-span-3 flex h-[40px] w-[40px] flex-col justify-center rounded font-medium text-primary"
                        size={"large"}
                      >
                        {workspace?.name[0]}
                      </Avatar>
                      <Text
                        className="w-[150px]"
                        ellipsis={{
                          tooltip: workspace.name,
                        }}
                      >
                        {workspace.name}
                      </Text>
                    </div>
                  </div>
                </Radio>
                <Dropdown
                  trigger={["click"]}
                  placement="bottomRight"
                  menu={{ items: menuItems }}
                  open={workspace.id === workspaceInMoreMode}
                  dropdownRender={(dropdownRender) =>
                    workspaceMoreDropdown(dropdownRender, workspace)
                  }
                  className=" flex h-fit w-[20px] items-center justify-center rounded p-1"
                  onOpenChange={(v) => {
                    if (v) setWorkspaceInMoreMode(workspace.id);
                    else if (workspaceInMoreMode === workspace.id) {
                      setWorkspaceInMoreMode(null);
                    }
                  }}
                >
                  <Button className="m-0 p-0">
                    <LuMoreHorizontal />
                  </Button>
                </Dropdown>
              </div>
            ))}
          </div>
        </Radio.Group>
      </div>
      <div style={{ padding: 8 }}></div>
      <div
        onClick={() => {
          setMode(0);
          setIsModalOpen(true);
          setDropdownOpen(false);
        }}
        className="mx-4 flex w-auto cursor-pointer items-center justify-start gap-4 rounded py-3 pl-2 hover:bg-neutral-100"
      >
        <PlusIconSvg stroke={"black"} />
        <div> Add new workspace</div>
      </div>
      <div style={{ padding: 8 }}></div>
      <Divider style={{ margin: 0 }} />
      <div style={{ padding: 8 }}></div>
      <div className="flex w-full ">
        <SyncButtonComponent
          text="Sync"
          type="ghost"
          onClick={syncFunction}
          className="mx-4 w-full gap-3 rounded p-0 py-2 pl-4"
        />
      </div>
      <div style={{ padding: 2 }}></div>
      <div className="flex w-full" onClick={() => setDropdownOpen(false)}>
        <LogOutButton className="hover-bg-neutral-100 mx-4 py-2 pl-3" />
      </div>
    </div>
  );

  const workspaceMoreDropdown = (
    menu: React.ReactNode,
    tmpWorkspace: WorkspaceDto
  ) => (
    <div style={contentStyle} className="py-4 font-semibold">
      <div
        className={`mx-4 flex items-center gap-2 ${
          tmpWorkspace.active
            ? " cursor-pointer"
            : "cursor-not-allowed  text-gray-300"
        }`}
        onClick={() => {
          if (tmpWorkspace.active) {
            setMode(1);
            setSelectedWorkspace(tmpWorkspace);

            setIsModalOpen(true);
            setWorkspaceInMoreMode(null);
            setDropdownOpen(false);
          }
        }}
      >
        <LuPenLine /> Edit
      </div>
      <div style={{ padding: 8 }}></div>
      <div
        className={`mx-4 flex items-center gap-2 ${
          !tmpWorkspace.active
            ? " cursor-pointer"
            : "cursor-not-allowed text-gray-300"
        }`}
        onClick={() => {
          if (!tmpWorkspace.active) {
            handleWorkspaceDeleteClick(tmpWorkspace);
            setWorkspaceInMoreMode(null);
            setDropdownOpen(false);
          }
        }}
      >
        <LuTrash2 /> Delete
      </div>
    </div>
  );

  return (
    <>
      <Dropdown
        menu={{ items: menuItems }}
        trigger={["click"]}
        placement="topRight"
        arrow
        dropdownRender={dropdownRender}
        // className="w-[250px]"
        open={isDropdownOpen}
        onOpenChange={(v) => {
          setDropdownOpen(v);
        }}
      >
        <div className="flex h-max cursor-pointer items-center rounded-lg border-2 p-1">
          <div className="ice grid grid-cols-12 gap-2">
            <Avatar
              className="col-span-3 flex h-[48px] w-[48px] flex-col justify-center rounded font-medium text-primary"
              size={"large"}
            >
              {activeWorkspace?.name?.length > 0
                ? activeWorkspace?.name[0]
                : "?"}
            </Avatar>
            {activeWorkspace ? (
              <div className="col-span-7">
                <div className="flex flex-col text-left">
                  <Text
                    className="text-left font-medium"
                    ellipsis={{
                      tooltip: activeWorkspace?.name,
                    }}
                  >
                    {activeWorkspace?.name}
                  </Text>
                  <Text
                    className="text-left text-[13px]"
                    ellipsis={{
                      tooltip: activeUserWorkspace?.designation,
                    }}
                  >
                    {activeUserWorkspace?.designation}
                  </Text>
                </div>
              </div>
            ) : (
              <div className=" col-span-7">Select Or Create Workspace</div>
            )}
            <div className="col-span-1 flex flex-col justify-center">
              {isDropdownOpen ? <UpOutlined /> : <DownOutlined />}
            </div>
          </div>
        </div>
      </Dropdown>
      <GlobalModal
        {...{ isModalOpen, setIsModalOpen }}
        title={modalTitles[mode]}
        width={350}
      >
        <Spin spinning={isModalLoading}>
          {mode === 1 && (
            <EditWorkspace
              workspace={selectedWorkspace}
              setSelectedWorkspace={setSelectedWorkspace}
              setIsModalOpen={setIsModalOpen}
            />
          )}
          {mode === 2 && (
            <DeleteWorkspaceWarning
              workspace={selectedWorkspace}
              setIsModalOpen={setIsModalOpen}
              setIsModalLoading={setIsModalLoading}
              setSelectedWorkspace={setSelectedWorkspace}
            />
          )}
          {mode === 0 && (
            <AddNewWorkspace
              setIsModalOpen={setIsModalOpen}
              setIsModalLoading={setIsModalLoading}
            />
          )}
        </Spin>
      </GlobalModal>
    </>
  );
};

export default WorkspaceNav;
