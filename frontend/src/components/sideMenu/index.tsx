import { Button, Dropdown, MenuProps, Typography } from "antd";
import { userAPI } from "APIs";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  LuChevronRight,
  LuClipboardList,
  LuFolder,
  LuHelpCircle,
  LuLayoutDashboard,
  LuMail,
  LuMoreVertical,
  LuNewspaper,
  LuPlug,
  LuPlus,
  LuSettings,
  LuUserCircle2,
} from "react-icons/lu";
import { useDispatch } from "react-redux";

import BSLogoSvg from "@/assets/svg/BSLogoSvg";
import DeleteIconSvg from "@/assets/svg/DeleteIconSvg";
import MyLink from "@/components/common/link/MyLink";
import GlobalModal from "@/components/modals/globalModal";
import { useAppSelector } from "@/storage/redux";
import { addReportPage, ReportPageDto } from "@/storage/redux/reportsSlice";
import { RootState } from "@/storage/redux/store";
import { LoadingOutlined } from "@ant-design/icons";

import DeleteReportPageWarning from "./components/deletePageWarning";
import WorkspaceNav from "./components/workspaceNav";

const { Text } = Typography;

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
];

export const sideMenuFucntionOptions = [
  {
    link: "/dashboard",
    title: "Dashboard",
    icon: <LuLayoutDashboard size={16} />,
  },
  {
    link: "/taskList",
    title: "All Tasks",
    icon: <LuClipboardList size={16} />,
  },
];

export const sideMenuManageOptions = [
  {
    link: "/integrations",
    title: "Integrations",
    icon: <LuPlug size={16} />,
  },
  {
    link: "/projects",
    title: "Projects",
    icon: <LuFolder size={16} />,
  },
  {
    link: "/invitations",
    title: "Invitations",
    icon: <LuMail size={16} />,
  },
  {
    link: "/members",
    title: "Members",
    icon: <LuUserCircle2 size={16} />,
  },
  {
    link: "/settings",
    title: "Settings",
    icon: <LuSettings size={16} />,
  },
  {
    link: "suggestion",
    title: "Suggestion/Support",
    icon: <LuHelpCircle size={16} />,
  },
];

const SideMenu = ({ toggleCollapsed }: { toggleCollapsed: () => void }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const reportPages = useAppSelector(
    (state: RootState) => state.reportsSlice.reportPages
  );

  const pageId = router.query?.reportPageId
    ? parseInt(router.query?.reportPageId as string)
    : -1;

  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [deletePage, setDeletePage] = useState<ReportPageDto>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [manageDropdownOpen, setManageDropdownOpen] = useState(true);
  const [reportDropdownOpen, setReportDropdownOpen] = useState(true);
  const [functionDropdownOpen, setFunctionDropdownOpen] = useState(true);

  const handleDeletePage = (page: ReportPageDto) => {
    setDeletePage(page);
    setIsDeleteModalOpen(true);
  };

  const handleCreatePage = async () => {
    setIsCreatingPage(true);
    const res = await userAPI.createReportPage({
      name: "Untitled",
    });
    if (res) {
      dispatch(addReportPage(res));
      router.push("/reports/" + res.id);
    }
    setIsCreatingPage(false);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F8F8F8]">
      <div className="flex h-full w-full flex-col justify-between">
        <div className="flex w-full flex-col gap-6">
          <div
            className="flex w-full gap-2 px-5 pt-8 text-left"
            onClick={() => {
              router.push("/taskList");
            }}
          >
            <div className="cursor-pointer">
              <BSLogoSvg />
            </div>
          </div>
          <div
            style={{
              maxHeight: "calc(100vh - 220px)",
            }}
            className="flex w-full flex-col gap-6 overflow-y-auto px-5"
          >
            <div className="flex flex-col gap-1">
              <div
                className={`flex w-min cursor-pointer items-center gap-2 rounded  p-1 pr-2 text-xs hover:bg-[#ECECED]`}
                onClick={() => setFunctionDropdownOpen(!functionDropdownOpen)}
              >
                <LuChevronRight
                  className={`${
                    functionDropdownOpen ? "rotate-90" : ""
                  } duration-400 transition-all`}
                />
                Overview
              </div>
              <div
                className={`${
                  functionDropdownOpen ? "" : "h-0"
                } duration-900 overflow-y-auto transition-all`}
              >
                <div className="flex flex-col gap-1">
                  {sideMenuFucntionOptions?.map((option) => (
                    <SideMenuOption
                      option={option}
                      key={option.title}
                      toggleCollapsed={toggleCollapsed}
                      active={router.asPath.includes(option.link)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div
                className={`flex w-min cursor-pointer items-center gap-2 rounded  p-1 pr-2 text-xs hover:bg-[#ECECED]`}
                onClick={() => setManageDropdownOpen(!manageDropdownOpen)}
              >
                <LuChevronRight
                  className={`${
                    manageDropdownOpen ? "rotate-90" : ""
                  } duration-400 transition-all`}
                />{" "}
                Manage
              </div>
              <div
                className={`${
                  manageDropdownOpen ? "" : "h-0"
                } duration-900 overflow-y-auto transition-all`}
              >
                <div className="flex flex-col gap-1">
                  {sideMenuManageOptions?.map((option) => (
                    <SideMenuOption
                      option={option}
                      key={option.title}
                      toggleCollapsed={toggleCollapsed}
                      active={router.asPath.includes(option.link)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between pr-2">
                <div
                  className={`flex w-min cursor-pointer items-center gap-2 rounded  p-1 pr-2 text-xs hover:bg-[#ECECED]`}
                  onClick={() => setReportDropdownOpen(!reportDropdownOpen)}
                >
                  <LuChevronRight
                    className={`${
                      reportDropdownOpen ? "rotate-90" : ""
                    } duration-400 transition-all`}
                  />
                  Reports
                </div>
                {reportDropdownOpen &&
                  (isCreatingPage ? (
                    <div className="flex h-[18px] w-[18px] flex-col items-center justify-center overflow-hidden">
                      <LoadingOutlined style={{ fontSize: 12 }} spin />
                    </div>
                  ) : (
                    <div
                      className="w-min cursor-pointer rounded border p-[1px] group-hover:border-secondary"
                      onClick={() => {
                        handleCreatePage();
                      }}
                    >
                      <LuPlus />
                    </div>
                  ))}
              </div>
              <div
                className={`${
                  reportDropdownOpen ? "" : "h-0"
                } duration-900 overflow-y-autotransition-all overflow-y-auto`}
              >
                <div className="flex flex-col gap-1">
                  {reportPages?.length > 0 && (
                    <div className="flex flex-col gap-1 overflow-y-auto">
                      {reportPages?.map((reportPage) => {
                        const items: MenuProps["items"] = [
                          {
                            key: "1",
                            label: (
                              <div
                                aria-disabled={"true"}
                                className={`flex gap-1 ${
                                  pageId === reportPage.id
                                    ? " cursor-not-allowed"
                                    : "cursor-pointer"
                                }`}
                                onClick={() => handleDeletePage(reportPage)}
                              >
                                <DeleteIconSvg />
                                Delete
                              </div>
                            ),
                          },
                        ];
                        return (
                          <div
                            key={reportPage.id}
                            className={`group flex w-full items-center justify-between gap-2 rounded px-0 py-[6px] pr-2 text-black hover:bg-[#ECECED] hover:text-primary ${
                              pageId === reportPage.id
                                ? "bg-[#ECECED] text-primary"
                                : ""
                            }`}
                          >
                            <MyLink
                              onClick={toggleCollapsed}
                              href={"/reports/" + reportPage.id}
                              className="flex items-center gap-2 px-2 py-1"
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
                              <div
                                className={`flex w-[120px] items-center
                                  ${
                                    pageId === reportPage.id
                                      ? " font-semibold text-primary"
                                      : " font-medium text-[#4D4E55]"
                                  }`}
                              >
                                <Text
                                  className="m-0 p-0 text-xs"
                                  ellipsis={{ tooltip: reportPage.name }}
                                >
                                  {reportPage.name}
                                </Text>
                              </div>
                            </MyLink>
                            <Dropdown
                              menu={{
                                items,
                                onClick: () => {},
                              }}
                              trigger={["click"]}
                              className="relative"
                              overlayClassName="absolute left-[-200px]"
                              placement="bottomRight"
                            >
                              <Button className="relative flex h-4 w-4 items-center justify-center p-0">
                                <LuMoreVertical size={10} />
                              </Button>
                            </Dropdown>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4">
          <WorkspaceNav />
        </div>
      </div>
      <GlobalModal
        title="Deleting Report Page"
        isModalOpen={isDeleteModalOpen}
        setIsModalOpen={setIsDeleteModalOpen}
        width={400}
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

type SideMenuProps = {
  active: boolean;
  toggleCollapsed: () => void;
  option: { link: any; title: String; icon: any };
};

const SideMenuOption = ({ option, active, toggleCollapsed }: SideMenuProps) => {
  const router = useRouter();
  const handleClick = () => {
    toggleCollapsed();
    option.link === "suggestion"
      ? window.open("https://tracker23.canny.io/feature-request")
      : router.push(option.link);
  };
  return (
    <div
      className={`group flex items-center gap-2 rounded-lg px-1 py-[6px] hover:cursor-pointer hover:bg-[#ECECED] hover:text-primary ${
        active ? "bg-[#ECECED] text-primary" : ""
      }`}
      onClick={handleClick}
    >
      <div
        className={` flex w-5 items-center text-xl group-hover:stroke-primary group-hover:text-primary ${
          active ? "stroke-primary " : "stroke-[#ADACB0] text-[#ADACB0]"
        }`}
      >
        {option.icon}
      </div>
      <div
        className={`text-xs ${
          active ? "font-semibold text-primary" : "font-medium text-[#4D4E55]"
        }`}
      >
        {option.title}
      </div>
    </div>
  );
};
