import { message, Spin } from "antd";
import { userAPI } from "APIs";
import classNames from "classnames";
import { GetWorkspaceListWithUserDto } from "models/workspaces";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { noNavbar, publicRoutes } from "utils/constants";

import { GetCookie } from "@/services/cookie.service";
import { initializeSocket } from "@/services/socket.service";
import { useAppDispatch, useAppSelector } from "@/storage/redux";
import { setIntegrationsSlice } from "@/storage/redux/integrationsSlice";
import { setNotifications } from "@/storage/redux/notificationsSlice";
import { setPriorities } from "@/storage/redux/prioritySlice";
import { setProjectsSlice } from "@/storage/redux/projectsSlice";
import { setSettingsReducer } from "@/storage/redux/settingsSlice";
import { RootState } from "@/storage/redux/store";
import { setSyncRunning, setSyncStatus } from "@/storage/redux/syncSlice";
import { setUserSlice } from "@/storage/redux/userSlice";
import { setWorkspacesSlice } from "@/storage/redux/workspacesSlice";

import Navbar from "../navbar";
import SideMenu from "../sideMenu";
import NoActiveWorkspace from "../workspaces/noActiveWorkSpace";
import { deleteFromLocalStorage } from "@/storage/storage";

const CustomLayout = ({ children }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const path = router.asPath;
  const isPublicRoute = publicRoutes.some((route) => path.includes(route));

  const dispatch = useAppDispatch();
  const syncRunning = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );
  const integrationsSlice = useAppSelector(
    (state: RootState) => state.integrations.integrations
  );
  const notificationsSlice = useAppSelector(
    (state: RootState) => state.notificationsSlice.notifications
  );
  const connectedSocket = useAppSelector(
    (state: RootState) => state.notificationsSlice.socket
  );
  const [syncing, setSyncing] = useState(
    useAppSelector((state: RootState) => state.syncStatus.syncRunning)
  );
  const userInfo = useAppSelector((state: RootState) => state.userSlice.user);
  const tmp = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );
  const reloadWorkspace = useAppSelector(
    (state: RootState) => state.workspacesSlice.reload
  );
  const projectStatuses = useAppSelector(
    (state: RootState) => state.projectList.projects
  );
  const workspacesList = useAppSelector(
    (state: RootState) => state.workspacesSlice.workspaces
  );
  const getProjectWiseStatues = async () => {
    if (!projectStatuses) {
      {
        const res = await userAPI.getIntegratedProjectStatuses();
        res && dispatch(setProjectsSlice(res));
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

  const getNotifications = async () => {
    const notifications = await userAPI.getNotifications();
    if (!(notificationsSlice?.length > 0) && notifications) {
      dispatch(setNotifications(notifications));
    }
  };
  const getSettings = async () => {
    const res = await userAPI.getWorkspaceSettings();
    res && dispatch(setSettingsReducer(res));
  };
  const getProjects = async () => {
    const res = await userAPI.getIntegratedProjectStatuses();
    res && dispatch(setProjectsSlice(res));
    res && dispatch(setPriorities(res));
  };
  const initialLoading = async () => {
    await getIntegrations();
    await getNotifications();
    await getSettings();
    await getProjects();
  };
  useEffect(() => {
    if (!publicRoutes.some((route) => path.includes(route))) {
      userInfo?.activeWorkspace && initialLoading();
    }
  }, [
    publicRoutes.some((route) => path.includes(route)),
    path,
    userInfo?.activeWorkspace,
  ]);
  useEffect(() => {
    const connectSocket = async () => {
      GetCookie("access_token") &&
        !connectedSocket &&
        (await initializeSocket());
    };
    let timeout: NodeJS.Timeout;
    timeout =
      !publicRoutes.some((route) => path.includes(route)) &&
      !connectedSocket &&
      setTimeout(connectSocket, 2000);
    const cleanup = () => {
      clearTimeout(timeout);
    };

    return cleanup;
  });
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
      userInfo?.activeWorkspace &&
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
      if (tmp && userInfo?.activeWorkspace) {
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
  const getWorkspaces = async () => {
    const res: GetWorkspaceListWithUserDto = await userAPI.getWorkspaceList();
    console.log("🚀 ~ file: layout.tsx:159 ~ getWorkspaces ~ res:", res);
    if (res.user) {
      // const activeWorkspace = res.user.activeWorkspace;
      // const workspaces = res.workspaces.map((workspace) => {
      //   return {
      //     ...workspace,
      //     active: workspace.id === res.user.activeWorkspaceId,
      //   };
      // });
      // const activeUserWorkspace = activeWorkspace?.userWorkspaces.find(
      //   (userWorkspace) => userWorkspace.userId === res.user.id
      // );
      dispatch(
        setUserSlice({ ...res.user, role: res.user.activeUserWorkspace?.role })
      );
      res.workspaces && dispatch(setWorkspacesSlice(res.workspaces));
    } else {
      const errorRes: any = res;
      errorRes?.error?.message && message.error(errorRes?.error?.message);
      // logOutFunction();
    }
    setLoading(false);
  };

  useEffect(() => {
    if (
      !publicRoutes.some((route) => path.includes(route)) &&
      !path.includes("socialLogin")
    ) {
      if (!(workspacesList?.length > 0)) {
        setLoading(true);
        getWorkspaces();
      } else setLoading(false);
    }
  }, [router, path]);

  useEffect(() => {
    if (
      !publicRoutes.some((route) => path.includes(route)) &&
      !path.includes("socialLogin")
    ) {
      setLoading(true);
      getWorkspaces();
    }
  }, [reloadWorkspace]);
  useEffect(() => {
    !["/inviteLink", "/socialLogin/redirect"].some((route) =>
      path.includes(route)
    ) && deleteFromLocalStorage("invitationCode");
  }, [path]);
  return (
    <>
      {loading &&
      !path.includes("socialLogin") &&
      !publicRoutes.some((route) => path.includes(route)) ? (
        <div className="h-screen">
          <Spin
            spinning={
              loading && !publicRoutes.some((route) => path.includes(route))
            }
            tip={"Loading"}
            className="inset-0 m-auto h-full "
          >
            <div className="h-screen "></div>
          </Spin>
        </div>
      ) : (
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
          {userInfo?.activeWorkspace ||
          path.includes("socialLogin") ||
          publicRoutes.some((route) => path.includes(route)) ? (
            <div
              className={classNames("flex w-full flex-col overflow-y-auto", {
                "px-8": !isPublicRoute && !path.includes("onBoarding"),
              })}
            >
              {!isPublicRoute &&
                !path.includes("onBoarding") &&
                !noNavbar.some((route) => path.includes(route)) && <Navbar />}
              <div className="h-full w-full bg-white">
                {/* {!isPublicRoute && !path.includes("onBoarding") && (
                  <GlobalClock />
                )} */}
                {children}
              </div>
            </div>
          ) : (
            <div
              className={classNames("flex w-full flex-col overflow-y-auto", {
                "px-8": !isPublicRoute && !path.includes("onBoarding"),
              })}
            >
              <Navbar />
              <NoActiveWorkspace />
            </div>
          )}
        </div>
      )}

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
