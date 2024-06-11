import { useRouter } from "next/router";

import PrimaryButton2 from "@/components/common/buttons/primaryButton2";

import LeftPanelTopPicture from "./leftPanelTopPicture";

const AuthLeftPanel = () => {
  const router = useRouter();

  return (
    <div className=" bg-[url('/images/bg_login.svg')] bg-cover bg-no-repeat">
      <div className="relative mx-4 flex h-full flex-col md:mx-0 md:ml-[8%] md:w-full">
        <div className="absolute right-0 top-[8%] hidden h-1/2 w-full justify-end md:flex ">
          <LeftPanelTopPicture />
        </div>
        <div className="z-10 my-5 flex flex-col items-center gap-8 md:mt-[32%] md:items-start md:gap-20 lg:mt-[72%] 2xl:mt-[60%]">
          <div className="flex flex-col items-center gap-6 md:items-start">
            <div className="w-full text-center text-3xl font-semibold text-white md:w-3/4 md:text-start xl:text-5xl">
              Have you heard about Tracker23?
            </div>
            <div className="text-base text-white">
              Sign up or log in to start tracking your time
            </div>
          </div>
          {!router.asPath.includes("registration") && (
            <PrimaryButton2 onClick={() => router.push("/registration")}>
              Try Tracker23 Now
            </PrimaryButton2>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthLeftPanel;
