import { AiOutlineLogout } from "react-icons/ai";
import { BiImport } from "react-icons/bi";
import { TiExport } from "react-icons/ti";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { userAPI } from "APIs";
import BSLogoSvg from "@/assets/svg/BSLogoSvg";
import TasksIconSvg from "@/assets/svg/tasksIconSvg";
import DashboardIconSvg from "@/assets/svg/dashboardIconSvg";

const SideMenu = () => {
  const router = useRouter();
  const handleLogOut = async () => {
    console.log("logging out");
    const loggedOut = await userAPI.logout();
    if (loggedOut) router.push("/login");
  };
  const SideMenuOption = ({ option, active }: any) => {
    const router = useRouter();
    return (
      <div
        className={`group flex items-center gap-2 rounded-lg py-[10px] px-1 pl-[10px] hover:cursor-pointer hover:bg-[#ECECED] hover:text-black ${
          active ? "bg-[#ECECED] text-black" : ""
        }`}
        onClick={() => {
          router.push(option.link);
        }}
      >
        <div
          className={` group-hover:stroke-black group-hover:text-black ${
            active ? "stroke-black " : "stroke-[#ADACB0] text-[#ADACB0]"
          }`}
        >
          {option.icon}
        </div>
        <div
          className={`text-sm ${
            active ? "font-semibold text-black" : "font-medium text-[#4D4E55]"
          }`}
        >
          {option.title}
        </div>
      </div>
    );
  };
  return (
    <div className="flex h-screen w-[280px] items-center justify-center bg-[#F8F8F8] px-5">
      <div className="flex h-full w-full flex-col justify-between">
        <div className="flex w-full flex-col gap-6">
          {" "}
          <div
            // className="flex items-center justify-center rounded-md p-4 text-white hover:cursor-pointer"
            className="flex w-full gap-2 pt-8 text-left"
            onClick={() => {
              router.push("/");
            }}
          >
            <div className="">
              <BSLogoSvg />
            </div>
          </div>
          <div className=" rounded-md text-gray-200">
            <div className="flex flex-col gap-3">
              {sideMenuOptions?.map((option) => (
                <SideMenuOption
                  key={Math.random()}
                  option={option}
                  active={router.asPath.includes(option.link)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center pb-5 text-white">
          <div
            className="scale-110 rounded-full  p-1 hover:cursor-pointer hover:bg-indigo-500"
            onClick={handleLogOut}
          >
            <AiOutlineLogout />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;

export const sideMenuOptions = [
  { link: "/dashboard", title: "DashBoard", icon: <DashboardIconSvg /> },
  { link: "/taskList", title: "All Tasks", icon: <TasksIconSvg /> },
  {
    link: "/integrations",
    title: "Integrations",
    icon: <BiImport className="h-6 w-6" />,
  },
  {
    link: "/exports",
    title: "Exports",
    icon: <TiExport className="h-6 w-6" />,
  },
  // { link: "/onBoarding", title: "OnBoarding Page" },
];
