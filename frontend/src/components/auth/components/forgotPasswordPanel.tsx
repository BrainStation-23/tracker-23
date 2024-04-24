import { Modal, Spin } from "antd";
import { useState } from "react";

import BSLogoSvg from "@/assets/svg/BSLogoSvg";
import ForgotPasswordForm from "@/components/auth/forms/forgotPasswordForm";
import { LoadingOutlined } from "@ant-design/icons";

import AuthHeader from "./authHeader";

const ForgotPasswordPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="flex">
      <div className="m-auto flex h-fit max-w-[60%] flex-col gap-6 lg:max-w-[70%]">
        <BSLogoSvg height={40} />
        <AuthHeader
          title={"Forget Password"}
          subTitle={"Sign up or log in to start tracking your time"}
        />
        <ForgotPasswordForm setIsModalOpen={setIsModalOpen} />
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

export default ForgotPasswordPanel;
