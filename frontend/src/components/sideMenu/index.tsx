import { Button, Typography } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  LuClipboardList,
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
import DeleteIconSvg from "@/assets/svg/DeleteIconSvg";
import { useAppSelector } from "@/storage/redux";
import { ReportPageDto } from "@/storage/redux/reportsSlice";
import { RootState } from "@/storage/redux/store";

import MyLink from "../common/link/MyLink";
import GlobalModal from "../modals/globalModal";
import AddNewReportPage from "../report/components/addNewReportPage";
import DeleteReportPageWarning from "./components/deletePageWarning";
import WorkspaceNav from "./components/workspaceNav";

type SideMenuProps = {
  option: { link: any; title: String; icon: any };
  active: boolean;
};
const { Text } = Typography;

const SideMenu = () => {
  const router = useRouter();
  const reportPages = useAppSelector(
    (state: RootState) => state.reportsSlice.reportPages
  );
  const pageId = router.query?.reportPageId
    ? parseInt(router.query?.reportPageId as string)
    : -1;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePage, setDeletePage] = useState<ReportPageDto>();
  const handleDeletePage = (page: ReportPageDto) => {
    setDeletePage(page);
    setIsDeleteModalOpen(true);
  };
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
            <Button
              className="p-1 px-2"
              onClick={() => {
                setIsModalOpen(true);
              }}
            >
              <LuPlus />
            </Button>
          </div>
          <div className="ml-2 flex h-[130px] flex-col gap-2 overflow-y-auto p-5">
            {reportPages?.map((reportPage) => {
              return (
                <>
                  <div
                    className={`group flex w-full items-center justify-between gap-2 rounded px-2 text-black hover:bg-[#ECECED] hover:font-semibold hover:text-primary ${
                      pageId === reportPage.id
                        ? "bg-[#ECECED] font-semibold text-primary"
                        : ""
                    }`}
                  >
                    {" "}
                    <MyLink
                      href={"/reports/" + reportPage.id}
                      className="flex items-center  gap-2 p-1"
                    >
                      <div
                        className={`flex w-5 items-center text-xl group-hover:stroke-primary group-hover:text-primary ${
                          pageId === reportPage.id
                            ? "stroke-primary "
                            : "stroke-[#ADACB0] text-[#ADACB0]"
                        }`}
                      >
                        <LuNewspaper size={16} />
                      </div>
                      <div className="flex w-[120px] items-center">
                        <Text
                          className="m-0 p-0 text-xs "
                          ellipsis={{ tooltip: reportPage.name }}
                        >
                          {reportPage.name}
                        </Text>
                      </div>
                      {/* <MoreOutlined /> */}
                    </MyLink>
                    <div
                      aria-disabled={"true"}
                      className={`${
                        pageId === reportPage.id
                          ? " cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                      onClick={() =>
                        pageId !== reportPage.id && handleDeletePage(reportPage)
                      }
                    >
                      <DeleteIconSvg />
                    </div>
                  </div>
                </>
              );
            })}
          </div>
        </div>
      );
    }
    return (
      <div
        className={`group flex items-center gap-2 rounded-lg py-[6px] px-1 pl-[10px] hover:cursor-pointer hover:bg-[#ECECED] hover:text-primary ${
          active ? "bg-[#ECECED] text-primary" : ""
        }`}
        onClick={() => {
          console.log(router);
          option.link === "suggestion"
            ? window.open("https://tracker23.canny.io/feature-request")
            : router.push(option.link);
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
      <AddNewReportPage {...{ isModalOpen, setIsModalOpen }} />
      <GlobalModal
        title="Deleting Report Page"
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
      >
        <DeleteReportPageWarning
          page={deletePage}
          setIsModalOpen={setIsDeleteModalOpen}
        />
      </GlobalModal>
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
