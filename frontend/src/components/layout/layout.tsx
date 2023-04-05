import classNames from "classnames";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import Navbar from "../navbar";
import SideMenu from "../navbar/sideMenu";
import GlobalClock from "../stopWatch/globalClock";
import { useAppDispatch, useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { userAPI } from "APIs";
import { setSyncStatus, setSyncRunning } from "@/storage/redux/syncSlice";
import { message } from "antd";
import { publicRoutes } from "utils/constants";

const CustomLayout = ({ children }: any) => {
  const router = useRouter();
  const [showSideBar, setShowSideBar] = useState<boolean>(false);
  const path = router.asPath;
  const loginRoutes = ["/login", "/registration"];
  const isPublicRoute = loginRoutes.includes(router.pathname);

  const dispatch = useAppDispatch();
  const syncRunning = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );
  const [syncing, setSyncing] = useState(
    useAppSelector((state: RootState) => state.syncStatus.syncRunning)
  );

  useEffect(() => {
    let myTimeout: NodeJS.Timeout;

    const getSyncStatus = async () => {
      const res = await userAPI.syncStatus();
      res && dispatch(setSyncStatus(res));
      if (res.status === "IN_PROGRESS") {
        dispatch(setSyncRunning(true));
        myTimeout = setTimeout(getSyncStatus, 5000);
      } else {
        syncing && message.success("Sync Completed");
        dispatch(setSyncRunning(false));
      }
    };

    if (!publicRoutes.includes(router.pathname)) {
      console.log(router.pathname);

      getSyncStatus();
    }

    const cleanup = () => {
      clearTimeout(myTimeout);
    };

    return cleanup;
  }, [dispatch, syncing, router]);
  useEffect(() => {
    if (syncRunning !== syncing) setSyncing(syncRunning);
  }, [syncing, syncRunning]);

  return (
    <>
      <div className="flex">
        {!loginRoutes.some((route) => path.includes(route)) && (
          <div className="w-[300px]">
            <div className="fixed">
              <SideMenu />
            </div>
          </div>
        )}
        {/* {!loginRoutes.some((route) => path.includes(route)) && (
          <>
            <div
              className={`duration-500  ${showSideBar ? "pr-48" : "pr-0"} `}
              style={{ height: "calc(100vh - 80px)" }}
            >
              <SideBar
                showSideBar={showSideBar}
                setShowSideBar={setShowSideBar}
              />
            </div>
            <div
              className={`fixed left-0 p-4 hover:text-green-500  ${
                !showSideBar ? "delay-500 scale-x-100" : "scale-x-0 "
              } `}
              onClick={() => setShowSideBar(!showSideBar)}
            >
              <DoubleRightOutlined />
            </div>
          </>
        )} */}
        <div className="flex w-full flex-col overflow-y-auto pl-4">
          {!isPublicRoute && <Navbar />}

          <div
            className={classNames("h-full w-full bg-white", {
              "pl-8": !isPublicRoute,
            })}
          >
            {!isPublicRoute && <GlobalClock />}
            {children}
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={8000}
        hideProgressBar={false}
        newestOnTop={false}
        draggable={false}
        closeOnClick
        pauseOnHover
      />
    </>
  );
};

export default CustomLayout;
