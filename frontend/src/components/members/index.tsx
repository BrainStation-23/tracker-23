import { Button } from "antd";
import { InviteUserWorkspaceDto } from "models/invitations";
import { useEffect, useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

import GlobalMOdal from "../modals/globalModal";
import { userAPI } from "APIs";
import InviteToWorkspace from "../invitations/components/inviteToWorkspace";
import MemberList from "./components/memberList";
import MyActiveTab from "../common/tabs/MyActiveTab";
import MyInactiveTab from "../common/tabs/MyInactiveTab";
import PrimaryButton from "../common/buttons/primaryButton";

const MembersComponent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inviteList, setInviteList] = useState([]);
    const [memberList, setMemberList] = useState([]);
    const tabs = ["All", "Pending", "Responded"];
    const [activeTab, setActiveTab] = useState<"All" | "Pending" | "Responded">("All");

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
                    {/* {tabs?.map((tab: any) => {
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
          })} */}
                </div>
                <PrimaryButton onClick={() => setIsModalOpen(true)}>
                    <PlusIconSvg />
                    Invite
                </PrimaryButton>
            </div>
            <MemberList memberList={memberList} />

            <GlobalMOdal width={300} {...{ isModalOpen, setIsModalOpen, title: "Invite" }}>
                <InviteToWorkspace setIsModalOpen={setIsModalOpen} />
            </GlobalMOdal>
        </div>
    );
};

export default MembersComponent;
