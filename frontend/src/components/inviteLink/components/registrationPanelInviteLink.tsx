import { Modal, Spin } from "antd";
import { useState } from "react";

import AuthHeader from "@/components/auth/components/authHeader";
import GoogleLogin from "@/components/auth/components/googleLogin";
import RegistrationFormInvitedUser from "@/components/auth/forms/registrationFormInvitedUser";
import MyDivider from "@/components/common/MyDivider";
import { LoadingOutlined } from "@ant-design/icons";

type Props = {
  email?: string;
};
const RegistrationPanelInviteLink = ({ email }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="flex">
      <div className="m-auto flex h-fit max-w-[60%] flex-col gap-6 lg:max-w-[70%]">
        <AuthHeader
          title={"Sign up to Tracker23"}
          subTitle={"Sign up or log in to start tracking your time"}
        />
        <GoogleLogin setIsModalOpen={setIsModalOpen} />
        <MyDivider>or</MyDivider>
        <RegistrationFormInvitedUser
          setIsModalOpen={setIsModalOpen}
          email={email}
        />
      </div>
      <Modal
        open={isModalOpen}
        footer={null}
        closable={false}
        centered
        className="z-50 w-20 bg-transparent"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="flex h-40 flex-col items-center justify-center gap-4">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            size="large"
          />
          <h1>Logging In</h1>
        </div>
      </Modal>
    </div>
  );
};

export default RegistrationPanelInviteLink;
