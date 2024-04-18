import { useAppSelector } from "@/storage/redux";
import SideBanner from "./components/sideBanner";
import OnboardingSteps from "./steps/onboardingSteps";
import { RootState } from "@/storage/redux/store";

const OnBoarding = () => {
  const { status } = useAppSelector((state: RootState) => state.userSlice.user);
  if (status === "ONBOARD")
    return (
      <div className="grid h-screen grid-cols-5">
        <div className="col-span-3 ">
          <OnboardingSteps />
        </div>
        <div className="col-span-2 ">
          <SideBanner />
        </div>
      </div>
    );
  else return <></>;
};

export default OnBoarding;
