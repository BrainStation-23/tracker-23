import { RemoveAllCookies, RemoveCookie } from "@/services/cookie.service";
import { LogoutOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useRouter } from "next/router";
// import { LogOut } from "../APIs";
import { userAPI } from "../../APIs/index";
import LogoutIconSvg from "@/assets/svg/LogoutIconSvg";

const LogOutButton = () => {
  const router = useRouter();
  const handleLogOut = async () => {
    console.log("logging out");
    const loggedOut = await userAPI.logout();
    if (loggedOut) router.push("/login");
  };
  return (
    <button
      className="flex items-center gap-1"
      onClick={() => handleLogOut()}
    >
      <LogoutIconSvg />
      <span className="text-[15px] font-semibold">Log out</span>
    </button>
  );
};

export default LogOutButton;
