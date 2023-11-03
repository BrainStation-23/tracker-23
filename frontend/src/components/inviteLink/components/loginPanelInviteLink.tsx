import { Modal, Spin } from "antd";
import { useEffect, useState } from "react";

import BSLogoSvg from "@/assets/svg/BSLogoSvg";
import LoginFormInvitedUser from "@/components/auth/forms/loginFormInvitedUser";
import { LoadingOutlined } from "@ant-design/icons";

import AuthHeader from "../../auth/components/authHeader";
import GoogleLogin from "../../auth/components/googleLogin";
import MyDivider from "../../common/MyDivider";

type Props = {
  email?: string;
};
const LoginPanelInviteLink = ({ email }: Props) => {
  console.log(
    "🚀 ~ file: loginPanelInviteLink.tsx:16 ~ LoginPanelInviteLink ~ email:",
    email
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {}, [email]);
  return (
    <div className="flex">
      <div className="m-auto flex h-fit max-w-[60%] flex-col gap-6 lg:max-w-[70%]">
        <BSLogoSvg height={40} />
        <AuthHeader
          title={"Sign in to account"}
          subTitle={"   Sign up or log in to start tracking your time"}
        />
        <GoogleLogin setIsModalOpen={setIsModalOpen} />
        <MyDivider>or</MyDivider>
        <LoginFormInvitedUser setIsModalOpen={setIsModalOpen} email={email} />
      </div>
      <Modal
        open={isModalOpen}
        footer={null}
        closable={false}
        centered
        className="z-50 w-20 bg-transparent"
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
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

export default LoginPanelInviteLink;
