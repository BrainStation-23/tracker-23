import { userAPI } from "../../APIs/index";
import LogoutIconSvg from "@/assets/svg/LogoutIconSvg";

const LogOutButton = () => {
  const handleLogOut = async () => {
    console.log("logging out");
    userAPI.logout();
  };
  return (
    <button
      className="flex items-center gap-1 w-full"
      onClick={() => handleLogOut()}
    >
      <LogoutIconSvg />
      <span className="text-[15px] font-semibold">Log out</span>
    </button>
  );
};

export default LogOutButton;
