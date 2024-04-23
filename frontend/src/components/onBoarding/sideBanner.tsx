import LeftPanelTopPictureOnboarding from "./steps/leftPanelTopPicture";

const SideBanner = () => {
  return (
    <div className="w-full overflow-hidden bg-[url('/images/bg_login.svg')] bg-cover bg-no-repeat py-10 md:h-screen md:py-0">
      <div className="mx-auto flex h-full w-full flex-col items-center justify-center gap-5">
        <div className="hidden w-fit md:flex">
          <LeftPanelTopPictureOnboarding />
        </div>
        <div className="flex flex-col gap-6">
          <div className="w-full text-3xl font-semibold text-white xl:text-5xl">
            Welcome To Tracker 23
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBanner;
