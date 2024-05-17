import { Modal, Spin } from "antd";
import { useState } from "react";
import Logo from "@/assets/images/logo.png";

import MyDivider from "@/components/common/MyDivider";
import { LoadingOutlined } from "@ant-design/icons";

import LoginForm from "../forms/loginForm";
import AuthHeader from "./authHeader";
import GoogleLogin from "./googleLogin";
import Image from "next/image";

const LoginPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <div className="m-auto flex flex-col gap-3 px-4 py-5 md:max-w-[60%] md:gap-6 md:py-0 lg:max-w-[70%]">
        <div className="flex justify-center">
          <Image alt="tracker 23 logo" src={Logo} width={300} />
        </div>
        <AuthHeader
          title={"Sign in to account"}
          subTitle={"Sign up or log in to start tracking your time"}
        />
        <GoogleLogin setIsModalOpen={setIsModalOpen} />
        <MyDivider>or</MyDivider>
        <LoginForm setIsModalOpen={setIsModalOpen} />
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
          <h1>Logging In...</h1>
        </div>
      </Modal>
    </>
  );
};

export default LoginPanel;
