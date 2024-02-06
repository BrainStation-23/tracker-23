import { Tooltip } from "antd";
import { LoginResponseDto } from "models/auth";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { getLocalStorage } from "@/storage/storage";
import { SyncOutlined } from "@ant-design/icons";

import { sideMenuOptions } from "../sideMenu";
import NotificationSection from "./components/notificationSection";

type Props = {
  extraComponent?: any;
};

const Navbar = ({ extraComponent }: Props) => {
  const router = useRouter();
  const [userDetails, setUserDetails] = useState<LoginResponseDto>();

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

  useEffect(() => {
    const tmp = getLocalStorage("userDetails");
    if (!userDetails && tmp) setUserDetails(tmp);
  }, [userDetails, path]);

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
                <div className={`text-base font-semibold`}>
                  {option.title}
                  {router.asPath.includes("report") && reportPageData?.name ? (
                    "/" + reportPageData?.name
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            )
        )}
      </div>
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
    </div>
  );
};

export default Navbar;
