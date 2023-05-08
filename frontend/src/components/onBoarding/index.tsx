import SideBanner from "./components/sideBanner";
import OnboardingSteps from "./steps/onboardingSteps";

const OnBoarding = () => {
  return (
    <div className="flex">
      <SideBanner />
      <OnboardingSteps />
    </div>
  );
};

export default OnBoarding;
