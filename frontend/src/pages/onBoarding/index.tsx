import OnBoarding from "@/components/onBoarding";
import { userAPI } from "APIs";
import { NextPage } from "next";
var cookie = require("cookie");

const OnBoardingPage: NextPage = () => {
  return (
    <>
      <OnBoarding />
    </>
  );
};
export default OnBoardingPage;
