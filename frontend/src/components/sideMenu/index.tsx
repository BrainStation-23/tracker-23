import { Button } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  LuClipboardList,
  LuDownload,
  LuFolder,
  LuHelpCircle,
  LuLayoutDashboard,
  LuMail,
  LuNewspaper,
  LuPlug,
  LuPlus,
  LuSettings,
  LuUserCircle2,
} from "react-icons/lu";

import BSLogoSvg from "@/assets/svg/BSLogoSvg";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

import WorkspaceNav from "./components/workspaceNav";

type SideMenuProps = {
  option: { link: any; title: String; icon: any };
  active: boolean;
};

const SideMenu = () => {
  const router = useRouter();
  const reportPages = useAppSelector(
    (state: RootState) => state.reportsSlice.reportPages
  );
  const SideMenuOption = ({ option, active }: SideMenuProps) => {
    const router = useRouter();
    if (option.title === "Reports") {
      return (
        <div>
          <div
            // onClick={() => {
            //   option.link === "suggestion"
            //     ? window.open("https://tracker23.canny.io/feature-request")
            //     : router.push(option.link);
            // }}
            className={`group flex items-center justify-between rounded-lg py-[10px] px-2 pl-[10px]  hover:cursor-pointer hover:bg-[#ECECED] hover:text-primary ${
              active ? "bg-[#ECECED] text-primary" : ""
            }`}
          >
            <div
              className={`group flex items-center gap-2 rounded-lg  hover:bg-[#ECECED] hover:text-primary ${
                active ? "bg-[#ECECED] text-primary" : ""
              }`}
            >
              <div
                className={` flex w-5 items-center text-xl group-hover:stroke-primary group-hover:text-primary ${
                  active ? "stroke-primary " : "stroke-[#ADACB0] text-[#ADACB0]"
                }`}
              >
                {option.icon}
              </div>
              <div
                className={`text-sm ${
                  active
                    ? "font-semibold text-primary"
                    : "font-medium text-[#4D4E55]"
                }`}
              >
                {option.title}
              </div>
            </div>
            <Button className="p-1 px-2">
              <LuPlus />
            </Button>
          </div>
          <div className="ml-2 flex flex-col gap-2 p-5">
            {reportPages?.map((reportPage) => {
              return (
                <Link
                  href={"/reports/" + reportPage.id}
                  className="flex gap-2 bg-red-50 text-black"
                >
                  <div
                    className={` flex w-5 items-center text-xl group-hover:stroke-primary group-hover:text-primary ${
                      active
                        ? "stroke-primary "
                        : "stroke-[#ADACB0] text-[#ADACB0]"
                    }`}
                  >
                    <LuNewspaper size={16} />
                  </div>
                  {reportPage.name}
                </Link>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <div
        className={`group flex items-center gap-2 rounded-lg py-[10px] px-1 pl-[10px] hover:cursor-pointer hover:bg-[#ECECED] hover:text-primary ${
          active ? "bg-[#ECECED] text-primary" : ""
        }`}
        onClick={() => {
          console.log(router);
          // option.link === "suggestion"
          //   ? window.open("https://tracker23.canny.io/feature-request")
          //   : router.push(option.link);
        }}
      >
        <div
          className={` flex w-5 items-center text-xl group-hover:stroke-primary group-hover:text-primary ${
            active ? "stroke-primary " : "stroke-[#ADACB0] text-[#ADACB0]"
          }`}
        >
          {option.icon}
        </div>
        <div
          className={`text-sm ${
            active ? "font-semibold text-primary" : "font-medium text-[#4D4E55]"
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
          <div
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
          <WorkspaceNav />
        </div>
      </div>
    </div>
  );
};

export default SideMenu;

export const sideMenuOptions = [
  { link: "/dashboard", title: "Dashboard", icon: <LuLayoutDashboard /> },
  { link: "/taskList", title: "All Tasks", icon: <LuClipboardList /> },
  {
    link: "/integrations",
    title: "Integrations",
    icon: <LuPlug />,
  },
  {
    link: "/projects",
    title: "Projects",
    icon: <LuFolder />,
  },
  // {
  //   link: "/exports",
  //   title: "Exports",
  //   icon: <LuDownload />,
  // },
  {
    link: "/invitations",
    title: "Invitations",
    icon: <LuMail />,
  },
  {
    link: "/members",
    title: "Members",
    icon: <LuUserCircle2 />,
  },
  {
    link: "/settings",
    title: "Settings",
    icon: <LuSettings />,
  },
  {
    link: "reports",
    title: "Reports",
    icon: <LuNewspaper />,
  },
  {
    link: "suggestion",
    title: "Suggestion/Support",
    icon: <LuHelpCircle />,
  },
  // { link: "/onBoarding", title: "OnBoarding Page" },
];
