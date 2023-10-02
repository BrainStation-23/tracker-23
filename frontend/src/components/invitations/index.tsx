import { Button } from "antd";
import { userAPI } from "APIs";
import { InviteUserWorkspaceDto } from "models/invitations";
import { useEffect, useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

import PrimaryButton from "../common/buttons/primaryButton";
import MyActiveTab from "../common/tabs/MyActiveTab";
import MyInactiveTab from "../common/tabs/MyInactiveTab";
import GlobalMOdal from "../modals/globalModal";
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
        <InvitesList data={inviteList} activeTab={activeTab} />
      </div>
      <GlobalMOdal {...{ isModalOpen, setIsModalOpen, title: "Invite" }}>
        <InviteToWorkspace setIsModalOpen={setIsModalOpen} />
      </GlobalMOdal>
    </div>
  );
};

export default InvitationsComponent;
