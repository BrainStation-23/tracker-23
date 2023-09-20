import AuthPageLeftPanelMiddlePicture from "@/assets/svg/AuthPageLeftPanelMiddlePicture";
import { Button } from "antd";
import Image from "next/image";
import LeftPanelTopPicture from "./leftPanelTopPicture";

const AuthLeftPanel = () => {
  return (
    <div className=" bg-[url('/images/bg_login.svg')] bg-cover bg-no-repeat">
      <div className="relative ml-[8%] flex h-full w-full flex-col-reverse">
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
        <div className=" z-10 mb-[32%] flex flex-col gap-6 lg:mb-[22%] 2xl:mb-[25%]">
          <div className=" w-3/4 text-3xl font-semibold text-white xl:text-5xl 2xl:text-6xl">
            Have you heard about Tracker23 Tasks?
          </div>
          <div className="text-white  2xl:text-2xl">
            Sign up or log in to start tracking your time
          </div>
          <Button className="mt-12  2xl:text-2xl flex w-min items-center rounded-lg bg-white py-6 px-3 font-semibold">
            Try Tracker23 Now
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthLeftPanel;
