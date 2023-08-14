import { useRouter } from "next/router";
import BSLogoSvg from "@/assets/svg/BSLogoSvg";
import TasksIconSvg from "@/assets/svg/tasksIconSvg";
import DashboardIconSvg from "@/assets/svg/dashboardIconSvg";
import ExportsIconSvg from "@/assets/svg/ExportsIconSvg";
import IntegrationIconSvg from "@/assets/svg/IntegrationIconSvg";
import { BulbOutlined, MailOutlined } from "@ant-design/icons";
import WorkspaceSelection from "./components/workspaceSection";

const SideMenu = () => {
  const router = useRouter();
  const SideMenuOption = ({ option, active }: any) => {
    const router = useRouter();
    return (
      <div
        className={`group flex items-center gap-2 rounded-lg py-[10px] px-1 pl-[10px] hover:cursor-pointer hover:bg-[#ECECED] hover:text-black ${
          active ? "bg-[#ECECED] text-black" : ""
        }`}
        onClick={() => {
          option.link === "suggestion"
            ? window.open("https://tracker23.canny.io/feature-request")
            : router.push(option.link);
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
            <div className="cursor-pointer">
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
        <div className="mb-[45px]">
          <WorkspaceSelection />
        </div>
      </div>
    </div>
  );
};

export default SideMenu;

export const sideMenuOptions = [
  { link: "/dashboard", title: "Dashboard", icon: <DashboardIconSvg /> },
  { link: "/taskList", title: "All Tasks", icon: <TasksIconSvg /> },
  {
    link: "/integrations",
    title: "Integrations",
    icon: <IntegrationIconSvg />,
  },
  {
    link: "/projects",
    title: "Projects",
    icon: <IntegrationIconSvg />,
  },
  {
    link: "/exports",
    title: "Exports",
    icon: <ExportsIconSvg />,
    // icon: <TiExport className="h-6 w-6" />,
  },
  {
    link: "/invitations",
    title: "Invitations",
    icon: <MailOutlined />,
    // icon: <TiExport className="h-6 w-6" />,
  },
  {
    link: "suggestion",
    title: "Suggestion/Support",
    icon: <BulbOutlined style={{ fontSize: "24px" }} />,
  },
  // { link: "/onBoarding", title: "OnBoarding Page" },
];
