import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

import SideBanner from "@/components/onBoarding/sideBanner";
import OnboardingSteps from "@/components/onBoarding/steps/onboardingSteps";

const OnBoardingPage = () => {
  const { status } = useAppSelector((state: RootState) => state.userSlice.user);
  if (status === "ONBOARD")
    return (
      <div className="grid grid-cols-5 md:h-screen">
        <div className="order-last col-span-5 md:order-first md:col-span-3">
          <OnboardingSteps />
        </div>
        <div className="col-span-5 md:col-span-2">
          <SideBanner />
        </div>
      </div>
    );
  else return null;
};

export default OnBoardingPage;
