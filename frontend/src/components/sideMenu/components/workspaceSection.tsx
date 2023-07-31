import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { Avatar, Button, Dropdown, Menu, MenuProps } from "antd";
import { WorkspaceDto } from "models/workspaces";
import { useState } from "react";
import { useSelector } from "react-redux";

const WorkspaceSelection = () => {
  // const workspacesList = tmp; 
  const workspacesList = useAppSelector((state: RootState) => state.workspacesSlice.workspaces);

  const [selectedWorkspace, setSelectedWorkspace] =
    useState<WorkspaceDto | null>(
      workspacesList.findLast((workspace) => workspace.active)
    );

  const handleWorkspaceClick = (workspace: WorkspaceDto) => {
    setSelectedWorkspace(workspace);
  };

  const filteredWorkspaces = workspacesList.filter(
    (workspace) => workspace !== selectedWorkspace
  );
  const items: MenuProps["items"] = workspacesList
    .filter((workspace) => selectedWorkspace.id != workspace.id)
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
        label: <div className="ml-2">{workspace.name}</div>,
        onClick: () => handleWorkspaceClick(workspace),
        // disabled: workspace.active,
      };
    });
  console.log("🚀 ~ file: workspaceSection.tsx:30 ~  ~ items:", items);

  const dropdownRender = (menu: React.ReactNode) => (
    <div className="float-right">{menu}</div>
  );

  return (
    <>
      <Dropdown
        menu={{ items }}
        trigger={["click"]}
        placement="topRight"
        arrow
        dropdownRender={dropdownRender}
      >
        <Button className="h-max">
          <div className="flex items-center gap-2 p-2">
            <Avatar size={"small"}>{selectedWorkspace?.name[0]}</Avatar>
            {selectedWorkspace?.name}
          </div>
        </Button>
      </Dropdown>
    </>
  );
};

export default WorkspaceSelection;

const tmp: WorkspaceDto[] = [
  {
    id: 9,
    name: "Seefat's Workspace",
    picture: null,
    createdAt: "2023-07-25T09:31:57.368Z",
    updatedAt: "2023-07-25T09:31:57.368Z",
    creatorUserId: 10,
    userWorkspaces: [
      {
        id: 9,
        role: "ADMIN",
        valid: true,
        createdAt: "2023-07-25T09:31:57.709Z",
        updatedAt: "2023-07-25T09:31:57.709Z",
        userId: 10,
        workspaceId: 9,
        inviterId: null,
        invitationID: null,
        status: "ACTIVE",
      },
    ],
    active: true,
  },
  {
    id: 11,
    name: "Leon's Workspace",
    picture: null,
    createdAt: "2023-07-25T09:31:57.368Z",
    updatedAt: "2023-07-25T09:31:57.368Z",
    creatorUserId: 10,
    userWorkspaces: [
      {
        id: 9,
        role: "ADMIN",
        valid: true,
        createdAt: "2023-07-25T09:31:57.709Z",
        updatedAt: "2023-07-25T09:31:57.709Z",
        userId: 10,
        workspaceId: 9,
        inviterId: null,
        invitationID: null,
        status: "ACTIVE",
      },
    ],
    active: false,
  },
  {
    id: 12,
    name: "Himel's Workspace",
    picture: null,
    createdAt: "2023-07-25T09:31:57.368Z",
    updatedAt: "2023-07-25T09:31:57.368Z",
    creatorUserId: 10,
    userWorkspaces: [
      {
        id: 9,
        role: "ADMIN",
        valid: true,
        createdAt: "2023-07-25T09:31:57.709Z",
        updatedAt: "2023-07-25T09:31:57.709Z",
        userId: 10,
        workspaceId: 9,
        inviterId: null,
        invitationID: null,
        status: "ACTIVE",
      },
    ],
    active: false,
  },
];
