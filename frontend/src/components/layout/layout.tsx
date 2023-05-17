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
import { setProjectsSlice } from "@/storage/redux/projectsSlice";
import { setIntegrationsSlice } from "@/storage/redux/integrationsSlice";

const CustomLayout = ({ children }: any) => {
  const router = useRouter();
  const [showSideBar, setShowSideBar] = useState<boolean>(false);
  const path = router.asPath;
  const isPublicRoute = publicRoutes.includes(router.pathname);

  const dispatch = useAppDispatch();
  const syncRunning = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );
  const integrationsSlice = useAppSelector(
    (state: RootState) => state.integrations.integrations
  );
  const [syncing, setSyncing] = useState(
    useAppSelector((state: RootState) => state.syncStatus.syncRunning)
  );
  const tmp = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );
  const projectStatuses = useAppSelector(
    (state: RootState) => state.projectList.projects
  );

  const getProjectWiseStatues = async () => {
    if (!projectStatuses) {
      {
        const res = await userAPI.getProjectWiseStatus();
        console.log(
          "🚀 ~ file: layout.tsx:34 ~ getProjectWiseStatues ~ res:",
          res
        );
        res?.length > 0 && dispatch(setProjectsSlice(res));
      }
    }
  };
  const getIntegrations = async () => {
    const integrations =
      integrationsSlice?.length > 0
        ? integrationsSlice
        : await userAPI.getIntegrations();
    if (!(integrationsSlice?.length > 0) && integrations) {
      dispatch(setIntegrationsSlice(integrations));
      integrations?.length > 0 && getProjectWiseStatues();
    }
  };
  const initialLoading = async () => {
    await getIntegrations();
  };
  useEffect(() => {
    if (!publicRoutes.some((route) => path.includes(route))) {
      initialLoading();
    }
  }, [publicRoutes.some((route) => path.includes(route)), path]);
  useEffect(() => {
    const getSyncStatus = async () => {
      const res = await userAPI.syncStatus();
      res && dispatch(setSyncStatus(res));
      if (res.status === "IN_PROGRESS") {
        dispatch(setSyncRunning(true));
      } else if (res.status === "DONE") {
        syncing && message.success("Sync Completed");
        dispatch(setSyncRunning(false));
      }
    };
    let timeout: NodeJS.Timeout;
    timeout =
      !publicRoutes.some((route) => path.includes(route)) &&
      setTimeout(getSyncStatus, 2000);
    const cleanup = () => {
      clearTimeout(timeout);
    };

    return cleanup;
  }, [publicRoutes.some((route) => path.includes(route))]);

  useEffect(() => {
    let myTimeout: NodeJS.Timeout;

    const getSyncStatus = async () => {
      const res = await userAPI.syncStatus();
      res && dispatch(setSyncStatus(res));
      if (res.status === "IN_PROGRESS") {
        dispatch(setSyncRunning(true));
        myTimeout = setTimeout(getSyncStatus, 5000);
      } else if (res.status === "DONE") {
        syncing && message.success("Sync Completed");
        dispatch(setSyncRunning(false));
      }
    };

    if (!publicRoutes.includes(router.pathname)) {
      console.log(router.pathname);
      if (tmp) {
        myTimeout = setTimeout(getSyncStatus, 5000);
      }
    }

    const cleanup = () => {
      clearTimeout(myTimeout);
    };

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, syncing, router]);
  useEffect(() => {
    if (syncRunning !== syncing) setSyncing(syncRunning);
  }, [syncing, syncRunning]);

  return (
    <>
      <div className="flex">
        {!publicRoutes.some((route) => path.includes(route)) &&
          !path.includes("onBoarding") && (
            <div className="mr-6 w-[300px]">
              <div className="fixed">
                <SideMenu />
              </div>
            </div>
          )}
        {/* {!publicRoutes.some((route) => path.includes(route)) && (
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
        <div
          className={classNames("flex w-full flex-col overflow-y-auto", {
            "px-8": !isPublicRoute && !path.includes("onBoarding"),
          })}
        >
          {!isPublicRoute && !path.includes("onBoarding") && <Navbar />}

          <div className="h-full w-full bg-white">
            {!isPublicRoute && !path.includes("onBoarding") && <GlobalClock />}
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
