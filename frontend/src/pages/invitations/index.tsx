import { userAPI } from "APIs";
import { useEffect, useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import GlobalModal from "@/components/modals/globalModal";
import InvitesList from "@/components/invitations/invites";
import MyActiveTab from "@/components/common/tabs/MyActiveTab";
import MyInactiveTab from "@/components/common/tabs/MyInactiveTab";
import PrimaryButton from "@/components/common/buttons/primaryButton";
import InviteToWorkspace from "@/components/invitations/inviteToWorkspace";

const InvitationPage = () => {
  const tabs = ["All", "Pending", "Responded"];
  const [spinning, setSpinning] = useState(false);
  const [inviteList, setInviteList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Responded">(
    "All"
  );

  const getInviteList = async () => {
    setSpinning(true);
    const res = await userAPI.getWorkspaceInvitationList();
    if (res) setInviteList(res);
    setSpinning(false);
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
    <div className="px-4 pt-4 md:px-8">
      <div className="flex justify-between">
        <div className="flex gap-3">
          {tabs?.map((tab: any, index) => {
            return activeTab === tab ? (
              <MyActiveTab {...{ tab, setActiveTab }} key={index}>
                {tab === "All"
                  ? inviteList?.length
                  : tab === "Pending"
                  ? inviteList?.filter((invite) => invite.status === "INVITED")
                      ?.length
                  : inviteList?.filter((invite) => invite.status !== "INVITED")
                      ?.length}
              </MyActiveTab>
            ) : (
              <MyInactiveTab {...{ tab, setActiveTab }} key={index}>
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
          {...{ spinning, setSpinning }}
        />
      </div>
      <GlobalModal
        width={300}
        {...{ isModalOpen, setIsModalOpen, title: "Invite" }}
      >
        <InviteToWorkspace
          setIsModalOpen={setIsModalOpen}
          onSuccess={getInviteList}
        />
      </GlobalModal>
    </div>
  );
};

export default InvitationPage;
