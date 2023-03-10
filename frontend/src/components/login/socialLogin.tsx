import { Image, Modal, Spin, Tooltip } from "antd";
import axios from "axios";
import { config } from "config";
import Link from "next/link";
import { useState } from "react";

const SocialLogin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex flex-col items-center w-full">
      <div>Or login with ..</div>
      <div className="flex gap-6">
        <div className="mt-4" onClick={() => setIsModalOpen(true)}>
          <Tooltip
            placement="bottom"
            title={"Login with Facebook"}
            color="purple"
          >
            <Link href={`${config?.baseUrl}/auth/facebook/login`}>
              <div
                className="bg-blue-200 grayscale duration-1000 
              rounded-xl px-5 font-extrabold text-2xl py-2.5 
              hover:text-white 
              hover:grayscale-0 
              hover:bg-blue-700"
              >
                {/* <Image
                  height={20}
                  width={20}
                  preview={false}
                  src="/assets/images/facebookLogo.png"
                  alt="Error"
                /> */}
                f
              </div>
            </Link>
          </Tooltip>
        </div>

        <div className="mt-4" onClick={() => setIsModalOpen(true)}>
          <Tooltip
            placement="bottom"
            title={"Login with Google"}
            color="purple"
          >
            <Link href={`${config?.baseUrl}/auth/google`}>
              <div className="flex flex-col bg-red-100 grayscale duration-1000 rounded-xl hover:grayscale-0 p-4">
                <Image
                  height={20}
                  width={20}
                  preview={false}
                  src="/assets/images/googleIcon.png"
                  alt="Error"
                />
              </div>
            </Link>
          </Tooltip>
        </div>
      </div>
      <Modal
        // title="Logging In"
        open={isModalOpen}
        footer={null}
        closable={false}
        centered
        className="bg-transparent w-20"
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="flex flex-col gap-4 items-center justify-center h-40">
          <Spin size="large" />
          <h1>Logging In</h1>
        </div>
      </Modal>
    </div>
  );
};

export default SocialLogin;
