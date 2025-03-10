import { Modal, Spin } from "antd";
import { useEffect, useState } from "react";
import Logo from "@/assets/images/logo.png";

import AuthHeader from "@/components/auth/components/authHeader";
import GoogleLogin from "@/components/auth/components/googleLogin";
import LoginFormInvitedUser from "@/components/auth/forms/loginFormInvitedUser";
import MyDivider from "@/components/common/MyDivider";
import { LoadingOutlined } from "@ant-design/icons";
import Image from "next/image";

type Props = {
  email?: string;
  onlySocialLogin?: boolean;
};
const LoginPanelInviteLink = ({ email, onlySocialLogin }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {}, [email]);
  return (
    <div className="flex">
      <div className="m-auto flex h-fit max-w-[60%] flex-col gap-6 lg:max-w-[70%]">
        <Image alt="tracker 23 logo" src={Logo} width={300} />
        <AuthHeader
          title={"Sign in to account"}
          subTitle={"   Sign up or log in to start tracking your time"}
        />
        <GoogleLogin setIsModalOpen={setIsModalOpen} />
        {!onlySocialLogin && (
          <>
            <MyDivider>or</MyDivider>
            <LoginFormInvitedUser
              setIsModalOpen={setIsModalOpen}
              email={email}
            />
          </>
        )}
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

export default LoginPanelInviteLink;
