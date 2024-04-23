import { Button, Form, Input, message, Tooltip } from "antd";
import { userAPI } from "APIs";
import { LoginResponseDto } from "models/auth";
import { UpdateReportPageDto } from "models/reports";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { useAppSelector } from "@/storage/redux";
import { updateReportPageNameSlice } from "@/storage/redux/reportsSlice";
import { RootState } from "@/storage/redux/store";
import { getLocalStorage } from "@/storage/storage";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SyncOutlined,
} from "@ant-design/icons";

import { sideMenuOptions } from "../sideMenu";
import NotificationSection from "./components/notificationSection";
import classNames from "classnames";

type Props = {
  extraComponent?: any;
  collapsed?: boolean;
  toggleCollapsed?: () => void;
};

const Navbar = ({ extraComponent, collapsed, toggleCollapsed }: Props) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { reauthorization: isAuthorizationNeeded, type: reauthorizationType } =
    useAppSelector((state: RootState) => state.integrations.authorization);
  const [userDetails, setUserDetails] = useState<LoginResponseDto>();
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  const path = router.asPath;
  const pageId = router.query?.reportPageId
    ? parseInt(router.query?.reportPageId as string)
    : -1;

  const syncing: boolean = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );
  const reportPageData = useAppSelector(
    (state: RootState) => state.reportsSlice.reportPages
  ).find((reportPage) => reportPage.id === pageId);

  const handleReauthorization = async () => {
    let api;
    switch (reauthorizationType) {
      case "JIRA":
        api = userAPI.getJiraLink;
        break;
      case "JIRA":
        api = userAPI.getOutlookLink;
        break;
      default:
        break;
    }
    if (api) {
      try {
        const response = await api();
        window.open(response, "_self");
      } catch (error) {
        console.error(error);
        message.error(`Failed to ${reauthorizationType} authorization`);
      }
    } else {
      message.error("Something is wrong!!");
    }
  };

  const updatePageName = async (data: UpdateReportPageDto) => {
    if (!reportPageData?.id) return;
    const oldPage = { ...reportPageData };
    dispatch(updateReportPageNameSlice({ ...reportPageData, name: data.name }));
    const res = await userAPI.updateReportPage(reportPageData.id, data);
    if (!res) {
      message.error("Failed to update");
      dispatch(updateReportPageNameSlice(oldPage));
    }
  };
  const onFinish = (values: { name: string }) => {
    const trimmedValue = values?.name?.trim();
    if (trimmedValue && trimmedValue !== reportPageData.name) {
      updatePageName({
        name: trimmedValue,
      });
    }
    setEditing(false);
  };

  const handleBlur = (value: string) => {
    const trimmedValue = value?.trim();
    if (trimmedValue && trimmedValue !== reportPageData.name) {
      updatePageName({ name: trimmedValue });
    }
    setEditing(false);
  };

  useEffect(() => {
    const tmp = getLocalStorage("userDetails");
    if (!userDetails && tmp) setUserDetails(tmp);
  }, [userDetails, path]);

  return (
    <div className="flex h-16 w-full items-center justify-between border-b border-b-gray-100 bg-white px-2 md:px-8">
      <div className="flex items-center justify-center gap-4 py-6">
        <div className="md:hidden">
          {toggleCollapsed && (
            <Button type="text" onClick={toggleCollapsed} size="small">
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
          )}
        </div>
        {sideMenuOptions?.map(
          (option) =>
            router.asPath.includes(option.link) && (
              <div
                key={option.link}
                className="flex items-center gap-2 rounded-lg text-black"
              >
                <div className="stroke-black">{option.icon}</div>
                <div className="flex items-center gap-1 text-base font-semibold">
                  <div className="justify-center">{option.title}</div>
                  {router.asPath.includes("report") && reportPageData?.name && (
                    <div>/</div>
                  )}
                  {router.asPath.includes("report") && reportPageData?.name ? (
                    <div onClick={() => setEditing(true)}>
                      <Form
                        name="titleEdit"
                        onFinish={onFinish}
                        initialValues={{ name: reportPageData?.name }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            form.submit();
                          }
                          if (e.key === "Escape") {
                            setEditing(false);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2  text-base font-semibold">
                          <Form.Item
                            name="name"
                            className="m-0"
                            rules={[
                              {
                                required: true,
                                message: "Please input something!",
                              },
                              {
                                pattern: /\S.*|\s+/,
                                message: "Please enter valid name",
                              },
                            ]}
                          >
                            <Input
                              placeholder="Type something and press Enter"
                              className={classNames(
                                "m-0 bg-transparent p-0  px-1 text-base font-semibold focus:shadow-none",
                                {
                                  ["border-none"]: !editing,
                                }
                              )}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  form.submit();
                                }
                                if (e.key === "Escape") {
                                  setEditing(false);
                                }
                              }}
                              onBlur={(e) => handleBlur(e.target.value)}
                            />
                          </Form.Item>
                        </div>
                      </Form>
                    </div>
                  ) : null}
                </div>
              </div>
            )
        )}
      </div>
      <div className="flex items-center gap-4">
        {syncing && (
          <Tooltip
            placement="bottom"
            title={"Syncing"}
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-green-500"
          >
            <SyncOutlined spin={syncing} />
          </Tooltip>
        )}
        {isAuthorizationNeeded && (
          <Button
            htmlType="button"
            className="flex items-center border-none bg-red-600 py-4 font-bold text-white hover:text-white"
            onClick={handleReauthorization}
          >
            {`Authorize ${reauthorizationType}`}
          </Button>
        )}
        <NotificationSection />
        {extraComponent}
      </div>
    </div>
  );
};

export default Navbar;
