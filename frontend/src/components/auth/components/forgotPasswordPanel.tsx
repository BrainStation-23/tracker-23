import { useState } from "react";
import { Modal, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Logo from "@/assets/images/logo.png";

import AuthHeader from "./authHeader";
import ForgotPasswordForm from "@/components/auth/forms/forgotPasswordForm";
import Image from "next/image";

const ForgotPasswordPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <div className="m-auto flex h-fit flex-col items-center justify-center gap-6 p-4">
        <Image alt="tracker 23 logo" src={Logo} width={300} />
        <AuthHeader
          title="Forget Password"
          subTitle="Sign up or log in to start tracking your time"
        />
        <ForgotPasswordForm setIsModalOpen={setIsModalOpen} />
      </div>
      <Modal
        centered
        footer={null}
        closable={false}
        open={isModalOpen}
        className="z-50 w-20 bg-transparent"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="flex h-20 flex-col items-center justify-center gap-4 md:h-40">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            size="large"
          />
          <h1>Resetting...</h1>
        </div>
      </Modal>
    </>
  );
};

export default ForgotPasswordPanel;
