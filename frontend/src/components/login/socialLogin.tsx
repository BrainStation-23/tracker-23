import { Image, Modal, Spin, Tooltip } from "antd";
import axios from "axios";
import { config } from "config";
import Link from "next/link";
import { useState } from "react";

const SocialLogin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex w-full flex-col items-center">
      <div>Or login with ..</div>
      <div className="flex gap-6">
        {/* <div className="mt-4" onClick={() => setIsModalOpen(true)}>
          <Tooltip
            placement="bottom"
            title={"Login with Facebook"}
            color="purple"
          >
            <Link href={`${config?.baseUrl}/auth/facebook/login`}>
              <div
                className="rounded-xl bg-blue-200 px-5 
              py-2.5 text-2xl font-extrabold grayscale duration-1000 
              hover:bg-blue-700 
              hover:text-white 
              hover:grayscale-0"
              >
                f
              </div>
            </Link>
          </Tooltip>
        </div> */}

        <div className="mt-4" onClick={() => setIsModalOpen(true)}>
          <Tooltip
            placement="bottom"
            title={"Login with Google"}
            color="purple"
          >
            <Link href={`${config?.baseUrl}/auth/google`}>
              <div className="flex flex-col rounded-xl bg-red-100 p-4 grayscale duration-1000 hover:grayscale-0">
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
        className="w-20 bg-transparent"
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="flex h-40 flex-col items-center justify-center gap-4">
          <Spin size="large" />
          <h1>Logging In</h1>
        </div>
      </Modal>
    </div>
  );
};

export default SocialLogin;
