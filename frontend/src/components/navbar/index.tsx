import { GetCookie } from "@/services/cookie.service";
import { Avatar, Button } from "antd";
import LogOutButton from "../logOutButton";
import { useRouter } from "next/router";
import { getLocalStorage } from "@/storage/storage";
import { useEffect, useState } from "react";
import { LoginResponseDto } from "models/auth";

function Navbar() {
  const [userDetails, setUserDetails] = useState<LoginResponseDto>();
  const router = useRouter();
  const path = router.asPath;
  const btnText = path === "/login" ? "Register" : "Login";
  const access_token = GetCookie("access_token");
  useEffect(() => {
    const tmp = getLocalStorage("userDetails");
    if (!userDetails && tmp) setUserDetails(tmp);
  }, [userDetails, path]);
  return (
    <div className=" mb-2 flex h-16 w-full items-center justify-between px-5 shadow">
      <div
        className="py-6 text-xl text-blue-500  hover:text-green-500"
        onClick={() => {
          router.push("/");
        }}
      >
        Tracker23
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
          <div className="flex items-center gap-2">
            {userDetails?.picture ? (
              <Avatar src={userDetails.picture} alt="N" />
            ) : (
              <Avatar
                src={
                  "https://st3.depositphotos.com/15437752/19006/i/600/depositphotos_190061104-stock-photo-silhouette-male-gradient-background-white.jpg"
                }
                alt="N"
              />
            )}
            {userDetails?.firstName} {userDetails?.lastName}
          </div>
          {/* <LogOutButton /> */}
        </div>
      )}
    </div>
  );
}

export default Navbar;
