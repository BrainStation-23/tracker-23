"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import ALertCircleIconSvg from "@/assets/svg/ALertCircleIconSvg";
import LogOutButton from "@/components/logout/logOutButton";
import { logOutFunction } from "@/components/logout/logoutFunction";
import { getLocalStorage } from "@/storage/storage";

const InvalidUserPage = () => {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState(
    getLocalStorage("userDetails")
  );
  useEffect(() => {
    if (!getLocalStorage("userDetails")) {
      logOutFunction();
      router.push("/login");
    }
    setUserDetails(getLocalStorage("userDetails"));
  }, [userDetails]);

  return (
    <div className="m-auto flex h-screen w-full flex-col items-center justify-center">
      <div className=" m-auto mt-[10%] flex w-[540px] flex-col gap-4 rounded-md border-2 border-[#5670f2] bg-[#16dede0f] p-4">
        <ALertCircleIconSvg />
        <div className="flex flex-col gap-4 text-base font-medium">
          <span>Dear {userDetails?.firstName},</span>
          <span>
            Thank you for joining the Tracker23 waiting list! Our team is
            working hard to bring our product to life and we will keep you
            updated on our progress. Thank you for being an early adopter and
            supporting us.
          </span>
          <span> Best, Tracker23 Team</span>
          <LogOutButton />
        </div>
      </div>
    </div>
  );
};

export default InvalidUserPage;
