import ALertCircleIconSvg from "@/assets/svg/ALertCircleIconSvg";
import { getLocalStorage } from "@/storage/storage";
import LogOutButton from "../logout/logOutButton";
import { useEffect } from "react";
import { useState } from "react";
import { logOutFunction } from "../logout/logoutFunction";

const InvalidUserPage = () => {
  const [userDetails, setUserDetails] = useState(
    getLocalStorage("userDetails")
  );
  console.log(
    "🚀 ~ file: index.tsx:11 ~ InvalidUserPage ~ userDetails:",
    userDetails
  );
  useEffect(() => {
    if (!getLocalStorage("userDetails")) {
      logOutFunction();
    }
    setUserDetails(getLocalStorage("userDetails"));
  }, []);

  return (
    <div className="m-auto flex h-screen w-full flex-col items-center justify-center">
      <div className=" m-auto mt-[10%] flex w-[540px] flex-col gap-4 rounded-md border-2 border-[#5670f2] bg-[#16dede0f] p-4">
        <ALertCircleIconSvg />
        <div className="flex flex-col gap-4 text-base font-medium">
          <span>Dear {userDetails?.firstName},</span>
          <span>
            Thank you for joining the Tracker23 waitlist! Our team is working
            hard to bring our product to life and we will keep you updated on
            our progress. Thank you for being an early adopter and supporting
            us.
          </span>
          <span> Best, Tracker23 Team</span>
          <LogOutButton />
        </div>
      </div>
    </div>
  );
};

export default InvalidUserPage;
