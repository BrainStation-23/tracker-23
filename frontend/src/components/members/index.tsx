import { Empty, Spin } from "antd";
import { useEffect, useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

import GlobalModal from "../modals/globalModal";
import { userAPI } from "APIs";
import InviteToWorkspace from "../invitations/components/inviteToWorkspace";
import MemberList from "./components/memberList";
import PrimaryButton from "../common/buttons/primaryButton";
import { WorkspaceMemberDto } from "models/user";

const MembersComponent = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberList, setMemberList] = useState<WorkspaceMemberDto[]>([]);

  const getMemberList = async () => {
    setLoading(true);
    const res = await userAPI.getWorkspaceMembers();
    if (res) setMemberList(res);
    setLoading(false);
  };

  useEffect(() => {
    getMemberList();
  }, []);
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <div className="flex gap-3">
          <div className="text-2xl font-bold">Workspace Members</div>
        </div>
        <PrimaryButton onClick={() => setIsModalOpen(true)}>
          <PlusIconSvg />
          Invite Member
        </PrimaryButton>
      </div>

      <Spin spinning={loading}>
        {memberList.length === 0 && !loading ? (
          <Empty description="No members found" />
        ) : memberList.length > 0 ? (
          <MemberList memberList={memberList} />
        ) : loading ? (
          <Empty description="Getting members..." />
        ) : (
          <Empty description="Nothing to show" />
        )}
      </Spin>

      <GlobalModal
        width={500}
        {...{ isModalOpen, setIsModalOpen, title: "Invite Member" }}
      >
        <InviteToWorkspace setIsModalOpen={setIsModalOpen} />
      </GlobalModal>
    </div>
  );
};

export default MembersComponent;
