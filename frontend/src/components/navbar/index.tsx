import { Button, MenuProps, Tooltip } from "antd";
import { userAPI } from "APIs";
import { LoginResponseDto } from "models/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { setSyncRunning, setSyncStatus } from "@/storage/redux/syncSlice";
import { getLocalStorage } from "@/storage/storage";
import { SyncOutlined } from "@ant-design/icons";

import SyncButtonComponent from "../common/buttons/syncButton";
import LogOutButton from "../logout/logOutButton";
import { sideMenuOptions } from "../sideMenu";
import NotificationSection from "./components/notificationSection";

type Props = {
  extraComponent?: any;
};

const Navbar = ({ extraComponent }: Props) => {
  const [userDetails, setUserDetails] = useState<LoginResponseDto>();
  const syncing: boolean = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );

  const router = useRouter();
  const path = router.asPath;
  const btnText = path === "/login" ? "Register" : "Login";

  const [pageInfo, setPageInfo] = useState([]);

  const dispatch = useAppDispatch();
  const syncFunction = async () => {
    dispatch(setSyncRunning(true));
    const res = await userAPI.syncTasks();
    res && dispatch(setSyncStatus(res));
  };

  useEffect(() => {
    const tmp = getLocalStorage("userDetails");
    if (!userDetails && tmp) setUserDetails(tmp);
  }, [userDetails, path]);
  const items: MenuProps["items"] = [
    {
      key: "1",
      icon: (
        <div className="w-[200px]">
          <SyncButtonComponent type="ghost" className="w-full" text="Sync" />
        </div>
      ),
      onClick: async () => {
        syncFunction();
      },
    },
    {
      key: "2",
      icon: (
        <div className="ml-3 w-[200px]">
          <LogOutButton />
        </div>
      ),
    },
  ];
  const menuProps = {
    items,
    onClick: () => {},
  };

  const dropdownRender = (menu: React.ReactNode) => (
    <div className="float-right">{menu}</div>
  );
  return (
    <div className=" mb-2 flex h-16 w-full items-center justify-between">
      <div className="py-6">
        {sideMenuOptions?.map(
          (option) =>
            router.asPath.includes(option.link) && (
              <div
                key={Math.random()}
                className={`flex items-center gap-2 rounded-lg text-black `}
              >
                <div className=" stroke-black">{option.icon}</div>
                <div className={`text-base font-semibold`}>{option.title}</div>
              </div>
            )
        )}
        {pageInfo[0] && (
          <div
            className={`flex items-center gap-2 rounded-lg text-black `}
            onClick={() => {
              router.push(pageInfo[0].link);
            }}
          >
            <div>{pageInfo[0].icon}</div>
            <div className={`text-sm`}>{pageInfo[0].title}</div>
          </div>
        )}
      </div>
      {path === "/login" || path === "/registration" ? (
        <Button
          type="primary"
          danger
          onClick={() => {
            router.push(`/${path === "/login" ? "registration" : "login"}`);
          }}
        >
          {btnText}
        </Button>
      ) : (
        <div className="flex items-center gap-4">
          {syncing && (
            <Tooltip
              placement="bottom"
              title={"Syncing "}
              className="flex h-9 w-9 cursor-pointer items-center justify-center text-green-500"
            >
              <SyncOutlined spin={syncing} />
            </Tooltip>
          )}

          <NotificationSection />

          {extraComponent}
        </div>
      )}
    </div>
  );
};

export default Navbar;
