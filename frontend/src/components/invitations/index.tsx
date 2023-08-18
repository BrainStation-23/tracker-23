import { Button } from "antd";
import { InviteUserWorkspaceDto } from "models/invitations";
import { useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

import GlobalMOdal from "../modals/globalModal";
import InvitesList from "./components/invites";
import InviteToWorkspace from "./components/inviteToWorkspace";

const InvitationsComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabs = ["All", "Pending", "Responded"];
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Responded">(
    "All"
  );
  const activeButton = (
    tab: "All" | "Pending" | "Responded",
    setActiveTab: Function
  ) => (
    <div
      key={Math.random()}
      className="flex cursor-pointer items-center gap-2 p-[11px]"
      style={{
        // background: "#00A3DE",
        border: "1px solid #00A3DE",
        borderRadius: "8px",
      }}
    >
      <div
        className="px-1 text-xs font-medium text-white"
        style={{
          background: "#00A3DE",
          borderRadius: "4px",
          color: "white",
        }}
      >
        {tab === "All"
          ? demoData?.length
          : tab === "Pending"
          ? demoData.filter((invite) => invite.status === "INVITED")?.length
          : demoData.filter((invite) => invite.status !== "INVITED")?.length}
      </div>
      <div className="text-[15px]">{tab}</div>
    </div>
  );

  const inactiveButton = (
    tab: "All" | "Pending" | "Responded",
    setActiveTab: Function
  ) => (
    <div
      key={Math.random()}
      className="flex cursor-pointer items-center gap-2 p-[11px]"
      style={{
        // background: "#00A3DE",
        border: "1px solid #ECECED",
        borderRadius: "8px",
      }}
      onClick={() => setActiveTab(tab)}
    >
      <div
        className="px-1 text-xs font-medium text-white"
        style={{
          background: "#E7E7E7",
          borderRadius: "4px",
          color: "black",
        }}
      >
        {tab === "All"
          ? demoData?.length
          : tab === "Pending"
          ? demoData.filter((invite) => invite.status === "INVITED")?.length
          : demoData.filter((invite) => invite.status !== "INVITED")?.length}
      </div>
      <div className="text-[15px] text-[#4D4E55]">{tab}</div>
    </div>
  );
  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-3">
          {tabs?.map((tab: any) => {
            return activeTab === tab
              ? activeButton(tab, setActiveTab)
              : inactiveButton(tab, setActiveTab);
          })}
        </div>
        <Button
          type="primary"
          className="flex items-center gap-2 py-3 text-[15px] text-white"
          onClick={() => setIsModalOpen(true)}
        >
          <PlusIconSvg />
          Invite
        </Button>
      </div>
      <div className="my-5">
        <InvitesList data={demoData} activeTab={activeTab} />
      </div>
      <GlobalMOdal {...{ isModalOpen, setIsModalOpen, title: "Invite" }}>
        <InviteToWorkspace setIsModalOpen={setIsModalOpen} />
      </GlobalMOdal>
    </div>
  );
};

export default InvitationsComponent;
const demoData: InviteUserWorkspaceDto[] = [
  {
    id: 1,
    role: "ADMIN",
    valid: true,
    createdAt: "2023-08-14T00:00:00Z",
    updatedAt: "2023-08-14T10:30:00Z",
    userId: 1,
    workspaceId: 1,
    inviterId: 2,
    invitationId: null,
    status: "ACTIVE",
    workspace: {
      id: 1,
      name: "Workspace 1",
      picture: null,
      createdAt: "2023-08-14T00:00:00Z",
      updatedAt: "2023-08-14T10:30:00Z",
      creatorUserId: 1,
    },
    inviter: {
      id: 2,
      email: "inviter@example.com",
      firstName: "Inviter",
      lastName: "Person",
      activeWorkspaceId: null,
      picture: null,
    },
  },
  {
    id: 2,
    role: "USER",
    valid: true,
    createdAt: "2023-08-14T01:00:00Z",
    updatedAt: "2023-08-14T09:45:00Z",
    userId: 1,
    workspaceId: 2,
    inviterId: 3,
    invitationId: null,
    status: "INVITED",
    workspace: {
      id: 2,
      name: "Workspace 2",
      picture: null,
      createdAt: "2023-08-14T01:00:00Z",
      updatedAt: "2023-08-14T09:45:00Z",
      creatorUserId: 2,
    },
    inviter: {
      id: 3,
      email: "inviter@example.com",
      firstName: "Inviter",
      lastName: "Person",
      activeWorkspaceId: null,
      picture: null,
    },
  },
  {
    id: 3,
    role: "USER",
    valid: true,
    createdAt: "2023-08-14T02:30:00Z",
    updatedAt: "2023-08-14T11:15:00Z",
    userId: 2,
    workspaceId: 1,
    inviterId: 4,
    invitationId: null,
    status: "ACTIVE",
    workspace: {
      id: 1,
      name: "Workspace 1",
      picture: null,
      createdAt: "2023-08-14T00:00:00Z",
      updatedAt: "2023-08-14T10:30:00Z",
      creatorUserId: 1,
    },
    inviter: {
      id: 4,
      email: "inviter@example.com",
      firstName: "Inviter",
      lastName: "Person",
      activeWorkspaceId: null,
      picture: null,
    },
  },
  {
    id: 4,
    role: "USER",
    valid: false,
    createdAt: "2023-08-14T03:45:00Z",
    updatedAt: "2023-08-14T12:00:00Z",
    userId: 3,
    workspaceId: 2,
    inviterId: 5,
    invitationId: null,
    status: "REJECTED",
    workspace: {
      id: 2,
      name: "Workspace 2",
      picture: null,
      createdAt: "2023-08-14T01:00:00Z",
      updatedAt: "2023-08-14T09:45:00Z",
      creatorUserId: 2,
    },
    inviter: {
      id: 5,
      email: "inviter@example.com",
      firstName: "Inviter",
      lastName: "Person",
      activeWorkspaceId: null,
      picture: null,
    },
  },
  {
    id: 5,
    role: "ADMIN",
    valid: true,
    createdAt: "2023-08-14T05:15:00Z",
    updatedAt: "2023-08-14T14:30:00Z",
    userId: 2,
    workspaceId: 2,
    inviterId: 6,
    invitationId: null,
    status: "INACTIVE",
    workspace: {
      id: 2,
      name: "Workspace 2",
      picture: null,
      createdAt: "2023-08-14T01:00:00Z",
      updatedAt: "2023-08-14T09:45:00Z",
      creatorUserId: 2,
    },
    inviter: {
      id: 6,
      email: "inviter@example.com",
      firstName: "Inviter",
      lastName: "Person",
      activeWorkspaceId: null,
      picture: null,
    },
  },
  {
    id: 6,
    role: "ADMIN",
    valid: true,
    createdAt: "2023-08-15T00:00:00Z",
    updatedAt: "2023-08-15T10:30:00Z",
    userId: 3,
    workspaceId: 3,
    inviterId: 7,
    invitationId: null,
    status: "ACTIVE",
    workspace: {
      id: 3,
      name: "Workspace 3",
      picture: null,
      createdAt: "2023-08-15T00:00:00Z",
      updatedAt: "2023-08-15T10:30:00Z",
      creatorUserId: 3,
    },
    inviter: {
      id: 7,
      email: "inviter@example.com",
      firstName: "Inviter",
      lastName: "Person",
      activeWorkspaceId: null,
      picture: null,
    },
  },
  {
    id: 7,
    role: "USER",
    valid: true,
    createdAt: "2023-08-15T01:00:00Z",
    updatedAt: "2023-08-15T09:45:00Z",
    userId: 3,
    workspaceId: 4,
    inviterId: 8,
    invitationId: null,
    status: "INVITED",
    workspace: {
      id: 4,
      name: "Workspace 4",
      picture: null,
      createdAt: "2023-08-15T01:00:00Z",
      updatedAt: "2023-08-15T09:45:00Z",
      creatorUserId: 4,
    },
    inviter: {
      id: 8,
      email: "inviter@example.com",
      firstName: "Inviter",
      lastName: "Person",
      activeWorkspaceId: null,
      picture: null,
    },
  },
  {
    id: 8,
    role: "USER",
    valid: true,
    createdAt: "2023-08-15T02:30:00Z",
    updatedAt: "2023-08-15T11:15:00Z",
    userId: 4,
    workspaceId: 3,
    inviterId: 9,
    invitationId: null,
    status: "ACTIVE",
    workspace: {
      id: 3,
      name: "Workspace 3",
      picture: null,
      createdAt: "2023-08-15T00:00:00Z",
      updatedAt: "2023-08-15T10:30:00Z",
      creatorUserId: 3,
    },
    inviter: {
      id: 9,
      email: "inviter@example.com",
      firstName: "Inviter",
      lastName: "Person",
      activeWorkspaceId: null,
      picture: null,
    },
  },
  {
    id: 9,
    role: "USER",
    valid: false,
    createdAt: "2023-08-15T03:45:00Z",
    updatedAt: "2023-08-15T12:00:00Z",
    userId: 5,
    workspaceId: 4,
    inviterId: 10,
    invitationId: null,
    status: "REJECTED",
    workspace: {
      id: 4,
      name: "Workspace 4",
      picture: null,
      createdAt: "2023-08-15T01:00:00Z",
      updatedAt: "2023-08-15T09:45:00Z",
      creatorUserId: 4,
    },
    inviter: {
      id: 10,
      email: "inviter@example.com",
      firstName: "Inviter",
      lastName: "Person",
      activeWorkspaceId: null,
      picture: null,
    },
  },
  {
    id: 10,
    role: "ADMIN",
    valid: true,
    createdAt: "2023-08-15T05:15:00Z",
    updatedAt: "2023-08-15T14:30:00Z",
    userId: 5,
    workspaceId: 4,
    inviterId: 1,
    invitationId: null,
    status: "INACTIVE",
    workspace: {
      id: 4,
      name: "Workspace 4",
      picture: null,
      createdAt: "2023-08-15T01:00:00Z",
      updatedAt: "2023-08-15T09:45:00Z",
      creatorUserId: 4,
    },
    inviter: {
      id: 1,
      email: "inviter@example.com",
      firstName: "Inviter",
      lastName: "Person",
      activeWorkspaceId: null,
      picture: null,
    },
  },
];
