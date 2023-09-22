import { Button } from "antd";
import { InviteUserWorkspaceDto } from "models/invitations";
import { useEffect, useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

import GlobalMOdal from "../modals/globalModal";
import { userAPI } from "APIs";
import InviteToWorkspace from "../invitations/components/inviteToWorkspace";
import MemberList from "./components/memberList";

const MembersComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteList, setInviteList] = useState([]);
  const [memberList, setMemberList] = useState([]);
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
          ? inviteList?.length
          : tab === "Pending"
          ? inviteList?.filter((invite) => invite.status === "INVITED")?.length
          : inviteList?.filter((invite) => invite.status !== "INVITED")?.length}
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
          ? inviteList?.length
          : tab === "Pending"
          ? inviteList?.filter((invite) => invite.status === "INVITED")?.length
          : inviteList?.filter((invite) => invite.status !== "INVITED")?.length}
      </div>
      <div className="text-[15px] text-[#4D4E55]">{tab}</div>
    </div>
  );

  const getInviteList = async () => {
    const res = await userAPI.getWorkspaceInvitationList();
    if (res) setInviteList(res);
  };

  const getMemberList = async () => {
    const res = await userAPI.getWorkspaceMembers();
    if (res) setMemberList(res);
  };

  useEffect(() => {
    getMemberList();
  }, []);
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
      <MemberList memberList={memberList} />

      <GlobalMOdal {...{ isModalOpen, setIsModalOpen, title: "Invite" }}>
        <InviteToWorkspace setIsModalOpen={setIsModalOpen} />
      </GlobalMOdal>
    </div>
  );
};

export default MembersComponent;
