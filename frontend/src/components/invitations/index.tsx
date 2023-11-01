import { Button } from "antd";
import { userAPI } from "APIs";
import { InviteUserWorkspaceDto } from "models/invitations";
import { useEffect, useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

import PrimaryButton from "../common/buttons/primaryButton";
import MyActiveTab from "../common/tabs/MyActiveTab";
import MyInactiveTab from "../common/tabs/MyInactiveTab";
import GlobalModal from "../modals/globalModal";
import InvitesList from "./components/invites";
import InviteToWorkspace from "./components/inviteToWorkspace";

const InvitationsComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteList, setInviteList] = useState([]);
  const tabs = ["All", "Pending", "Responded"];
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Responded">(
    "All"
  );

  const getInviteList = async () => {
    const res = await userAPI.getWorkspaceInvitationList();
    if (res) setInviteList(res);
  };
  const updateInviteList = (invite: any) => {
    const newInviteList = inviteList.map((inv) => {
      if (invite.id === inv.id) return invite;
      return inv;
    });
    setInviteList(newInviteList);
  };

  useEffect(() => {
    getInviteList();
  }, []);
  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-3">
          {tabs?.map((tab: any) => {
            return activeTab === tab ? (
              <MyActiveTab {...{ tab, setActiveTab }}>
                {tab === "All"
                  ? inviteList?.length
                  : tab === "Pending"
                  ? inviteList?.filter((invite) => invite.status === "INVITED")
                      ?.length
                  : inviteList?.filter((invite) => invite.status !== "INVITED")
                      ?.length}
              </MyActiveTab>
            ) : (
              <MyInactiveTab {...{ tab, setActiveTab }}>
                {tab === "All"
                  ? inviteList?.length
                  : tab === "Pending"
                  ? inviteList?.filter((invite) => invite.status === "INVITED")
                      ?.length
                  : inviteList?.filter((invite) => invite.status !== "INVITED")
                      ?.length}
              </MyInactiveTab>
            );
          })}
        </div>
        <PrimaryButton onClick={() => setIsModalOpen(true)}>
          <PlusIconSvg />
          Invite
        </PrimaryButton>
      </div>
      <div className="my-5">
        <InvitesList
          data={inviteList}
          activeTab={activeTab}
          updateInviteList={updateInviteList}
        />
      </div>
      <GlobalModal
        width={300}
        {...{ isModalOpen, setIsModalOpen, title: "Invite" }}
      >
        <InviteToWorkspace setIsModalOpen={setIsModalOpen} />
      </GlobalModal>
    </div>
  );
};

export default InvitationsComponent;
