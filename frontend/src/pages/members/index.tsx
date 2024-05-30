import { userAPI } from "APIs";
import { Empty, Spin } from "antd";
import { useEffect, useState } from "react";
import { WorkspaceMemberDto } from "models/user";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import MemberList from "@/components/members/memberList";
import GlobalModal from "@/components/modals/globalModal";
import PrimaryButton from "@/components/common/buttons/primaryButton";
import InviteToWorkspace from "@/components/invitations/inviteToWorkspace";

const MemberPage = () => {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberList, setMemberList] = useState<WorkspaceMemberDto[]>([]);

  const getMemberList = async () => {
    setLoading(true);
    const res = await userAPI.getWorkspaceMembers();
    if (res) setMemberList(res);
    setLoading(false);
  };

  const updateMember = (newMember: WorkspaceMemberDto) => {
    setMemberList(
      memberList.map((member) =>
        member.id === newMember.id ? newMember : member
      )
    );
  };

  useEffect(() => {
    getMemberList();
  }, []);

  return (
    <div className="px-8 pt-4">
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
          <MemberList memberList={memberList} updateMember={updateMember} />
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
        <InviteToWorkspace
          onSuccess={getMemberList}
          setIsModalOpen={setIsModalOpen}
        />
      </GlobalModal>
    </div>
  );
};

export default MemberPage;
