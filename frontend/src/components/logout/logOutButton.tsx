import LogoutIconSvg from "@/assets/svg/LogoutIconSvg";

import { logOutFunction } from "./logoutFunction";

type Props = {
  className?: string;
};
const LogOutButton = ({ className }: Props) => {
  return (
    <button
      className={` flex w-full items-center gap-1 rounded 
       ${className ? className : ""}`}
      onClick={logOutFunction}
    >
      <LogoutIconSvg />
      <div className="text-[15px] font-semibold">Log out</div>
    </button>
  );
};

export default LogOutButton;
