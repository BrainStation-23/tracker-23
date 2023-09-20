import { Divider, Modal, Spin } from "antd";
import LoginForm from "../forms/loginForm";
import AuthHeader from "./authHeader";
import GoogleLogin from "./googleLogin";
import MyDivider from "../../common/MyDivider";
import { useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import BSLogoSvg from "@/assets/svg/BSLogoSvg";
import RegistrationForm from "../forms/registrationForm";

const RegistrationPanel = () => {
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
          <h1>Logging In</h1>
        </div>
      </Modal>
    </div>
  );
};

export default RegistrationPanel;
