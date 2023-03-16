import { GetCookie } from "@/services/cookie.service";
import { Avatar, Button } from "antd";
import LogOutButton from "../logOutButton";
import { useRouter } from "next/router";
import { getLocalStorage } from "@/storage/storage";
import { useEffect, useState } from "react";
import { LoginResponseDto } from "models/auth";
import BellIconSvg from "@/assets/svg/BellIconSvg";
import { sideMenuOptions } from "./sideMenu";

function Navbar() {
  const [userDetails, setUserDetails] = useState<LoginResponseDto>();
  const router = useRouter();
  const path = router.asPath;
  const btnText = path === "/login" ? "Register" : "Login";
  const access_token = GetCookie("access_token");
  const [pageInfo, setPageInfo] = useState([]);
  useEffect(() => {
    const tmp = getLocalStorage("userDetails");
    if (!userDetails && tmp) setUserDetails(tmp);
  }, [userDetails, path]);
  useEffect(() => {
    setPageInfo(
      sideMenuOptions?.filter((option) => router.asPath.includes(option.link))
    );
  }, [router]);
  return (
    <div className=" mb-2 flex h-16 w-full items-center justify-between px-5">
      <div className="py-6 text-xl text-blue-500  hover:text-green-500">
        {pageInfo[0] && (
          <div
            className={`flex items-center gap-2 rounded-lg px-1 text-black `}
            onClick={() => {
              router.push(pageInfo[0].link);
            }}
          >
            <div>{pageInfo[0].icon}</div>
            <div className={`text-sm`}>{pageInfo[0].title}</div>
          </div>
        )}
      </div>
      {path === "/login" || path === "/registration" ? (
        <Button
          type="primary"
          danger
          onClick={() => {
            router.push(`/${path === "/login" ? "registration" : "login"}`);
          }}
        >
          {btnText}
        </Button>
      ) : (
        <div className="flex items-center gap-4">
          <div
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg"
            style={{
              border: "1px solid #ECECED",
            }}
          >
            <BellIconSvg />
          </div>
          <div className="flex items-center gap-2">
            {userDetails?.picture ? (
              <Avatar
                src={userDetails.picture}
                alt="N"
                className="h-[40px] w-[40px]"
              />
            ) : (
              <Avatar
                src={
                  "https://st3.depositphotos.com/15437752/19006/i/600/depositphotos_190061104-stock-photo-silhouette-male-gradient-background-white.jpg"
                }
                alt="N"
                className="h-[40px] w-[40px]"
              />
            )}
            <div className="flex flex-col text-sm">
              <span className="font-semibold">
                {userDetails?.firstName} {userDetails?.lastName}
              </span>
              <span className="font-normal text-[#4D4E55]">
                Project Manager
              </span>
            </div>
          </div>
          <LogOutButton />
        </div>
      )}
    </div>
  );
}

export default Navbar;
