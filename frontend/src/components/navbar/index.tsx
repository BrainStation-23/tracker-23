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
    <div className=" flex h-16 px-5 w-full justify-between items-center shadow mb-2">
      <div
        className="text-xl text-blue-500 hover:text-green-500  py-6"
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
            {userDetails?.picture && (
              <Avatar src={userDetails.picture} alt="N" />
            )}
            {userDetails?.firstName}
          </div>
          {/* <LogOutButton /> */}
        </div>
      )}
    </div>
  );
}

export default Navbar;
