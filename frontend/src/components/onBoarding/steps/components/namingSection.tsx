import { Radio, RadioChangeEvent, Space } from "antd";
import { useState } from "react";
import OnBoardingForm from "./onboardingForm";

const NamingStep = () => {
  const [value, setValue] = useState(1);

  const onChange = (e: RadioChangeEvent) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };
  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="px-1 text-xl font-semibold">
        What would you like to name your account?
      </div>
      <div className="pl-6">
        <OnBoardingForm />
      </div>
    </div>
  );
};

export default NamingStep;
