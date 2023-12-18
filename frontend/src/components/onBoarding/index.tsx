import { useAppSelector } from "@/storage/redux";
import SideBanner from "./components/sideBanner";
import OnboardingSteps from "./steps/onboardingSteps";
import { RootState } from "@/storage/redux/store";

const OnBoarding = () => {
  const { status } = useAppSelector((state: RootState) => state.userSlice.user);
  if (status === "ONBOARD")
    return (
      <div className="grid h-screen grid-cols-2">
        <SideBanner />
        <OnboardingSteps />
      </div>
    );
  else return <></>;
};

export default OnBoarding;
