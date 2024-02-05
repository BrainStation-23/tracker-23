import LeftPanelTopPicture from "@/components/auth/components/leftPanelTopPicture";

const SideBanner = () => {
  return (
    <div className="col-span-1 w-full bg-[url('/images/bg_login.svg')] bg-cover bg-no-repeat">
      <div className="relative ml-[8%] flex h-full w-full flex-col">
        <div className="absolute right-0 top-[8%] flex h-1/2 w-full justify-end ">
          <LeftPanelTopPicture />
        </div>
        <div className=" z-10 mt-[32%] flex flex-col gap-20 lg:mt-[72%] 2xl:mt-[60%]">
          <div className="flex flex-col gap-6">
            <div className="w-full text-3xl font-semibold text-white xl:text-5xl">
              Welcome To Tracker 23
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBanner;
