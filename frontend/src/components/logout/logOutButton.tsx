import { useDispatch } from "react-redux";
import { userAPI } from "../../../APIs/index";
import LogoutIconSvg from "@/assets/svg/LogoutIconSvg";
import { resetProjectsSlice } from "@/storage/redux/projectsSlice";
import { resetIntegrationsSlice } from "@/storage/redux/integrationsSlice";
import { setSocket } from "@/storage/redux/notificationsSlice";
type Props = {
  className?: string;
};
const LogOutButton = ({ className }: Props) => {
  const dispatch = useDispatch();
  const handleLogOut = async () => {
    dispatch(resetIntegrationsSlice());
    dispatch(resetProjectsSlice());
    dispatch(setSocket(null));
    console.log("logging out");
    userAPI.logout();
  };
  return (
    <button
      className={` flex w-full items-center gap-1 rounded 
       ${className ? className : ""}`}
      onClick={() => handleLogOut()}
    >
      <LogoutIconSvg />
      <div className="text-[15px] font-semibold">Log out</div>
    </button>
  );
};

export default LogOutButton;
