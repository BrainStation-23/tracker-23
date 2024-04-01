import { Modal, Spin } from "antd";
import { useState } from "react";

import MyDivider from "@/components/common/MyDivider";
import { LoadingOutlined } from "@ant-design/icons";

import RegistrationForm from "../forms/registrationForm";
import AuthHeader from "./authHeader";
import GoogleLogin from "./googleLogin";

const RegistrationPanel = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <div className="m-auto flex flex-col gap-3 px-4 py-2 md:max-w-[60%] md:gap-6 lg:max-w-[70%]">
        <AuthHeader
          title={"Sign up to Tracker23"}
          subTitle={"Sign up or log in to start tracking your time"}
        />
        <GoogleLogin setIsModalOpen={setIsModalOpen} />
        <MyDivider>or</MyDivider>
        <RegistrationForm setIsModalOpen={setIsModalOpen} />
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
          <h1>Signing Up...</h1>
        </div>
      </Modal>
    </>
  );
};

export default RegistrationPanel;
