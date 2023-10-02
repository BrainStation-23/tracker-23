import AuthPageLeftPanelMiddlePicture from "@/assets/svg/AuthPageLeftPanelMiddlePicture";
import { Button } from "antd";
import Image from "next/image";
import LeftPanelTopPicture from "./leftPanelTopPicture";
import { useRouter } from "next/router";
import PrimaryButton2 from "@/components/common/buttons/primaryButton2";

const AuthLeftPanel = () => {
  const router = useRouter();
  return (
    <div className=" bg-[url('/images/bg_login.svg')] bg-cover bg-no-repeat">
      <div className="relative ml-[8%] flex h-full w-full flex-col">
        <div className="absolute right-0 top-[8%] flex h-1/2 w-full justify-end ">
          {/* <Image
            alt=".."
            // preview={false}
            width={800}
            height={335}
            quality={100}
            src="/images/authLeftImage.png"
            className="h-fit w-fit"
          /> */}
          <LeftPanelTopPicture />
        </div>
        <div className=" z-10 mt-[32%] flex flex-col gap-20 lg:mt-[72%] 2xl:mt-[55%]">
          <div className="flex flex-col gap-6">
            <div className=" w-3/4 text-3xl font-semibold text-white xl:text-5xl 2xl:text-6xl">
              Have you heard about Tracker23 Tasks?
            </div>
            <div className="text-white  2xl:text-2xl">
              Sign up or log in to start tracking your time
            </div>
          </div>
          <PrimaryButton2
            onClick={() => {
              router.push("/registration");
            }}
          >
            Try Tracker23 Now
          </PrimaryButton2>
        </div>
      </div>
    </div>
  );
};

export default AuthLeftPanel;
