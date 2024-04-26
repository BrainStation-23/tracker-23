import Head from "next/head";
import classNames from "classnames";
import { useRouter } from "next/router";
import { ToastContainer } from "react-toastify";
import { useMediaQuery } from "react-responsive";
import { message, Spin, Layout, Drawer } from "antd";
import { ReactNode, useEffect, useState } from "react";

// Models
import { GetWorkspaceListWithUserDto } from "models/workspaces";
import {
  IntegrationDto,
  IntegrationType,
  AuthorizationErrorMessage,
} from "models/integration";

// Components
import Navbar from "@/components/navbar";
import SideMenu from "@/components/sideMenu";
import NoActiveWorkspace from "@/components/workspaces/noActiveWorkSpace";
import ReportSettings from "@/components/report/components/reportSettings";

// Service
import { userAPI } from "APIs";
import { GetCookie } from "@/services/cookie.service";
import { noNavbar, publicRoutes } from "utils/constants";
import { initializeSocket } from "@/services/socket.service";

// Storage
import {
  setIntegrationsSlice,
  setAuthorizationSlice,
  setIntegrationTypesSlice,
} from "@/storage/redux/integrationsSlice";
import { RootState } from "@/storage/redux/store";
import { setUserSlice } from "@/storage/redux/userSlice";
import { deleteFromLocalStorage } from "@/storage/storage";
import { setPriorities } from "@/storage/redux/prioritySlice";
import { setReportPages } from "@/storage/redux/reportsSlice";
import { setProjectsSlice } from "@/storage/redux/projectsSlice";
import { useAppDispatch, useAppSelector } from "@/storage/redux";
import { setSettingsReducer } from "@/storage/redux/settingsSlice";
import { setWorkspacesSlice } from "@/storage/redux/workspacesSlice";
import { setNotifications } from "@/storage/redux/notificationsSlice";
import { setSyncRunning, setSyncStatus } from "@/storage/redux/syncSlice";

import "react-toastify/dist/ReactToastify.css";

const layoutStyle = {
  width: "100%",
  height: "100vh",
  maxWidth: "100%",
  overflow: "hidden",
  minHeight: "100vh",
};

const ValidUserLayout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const syncRunning = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );
  const integrationsSlice = useAppSelector(
    (state: RootState) => state.integrations.integrations
  );

  const connectedSocket = useAppSelector(
    (state: RootState) => state.notificationsSlice.socket
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
  const reportInEdit = useAppSelector(
    (state: RootState) => state.reportsSlice.reportInEdit
  );
  const notificationsSlice = useAppSelector(
    (state: RootState) => state.notificationsSlice.notifications
  );
  const userInfo = useAppSelector((state: RootState) => state.userSlice.user);

  // State
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // Constant
  const path = router.asPath;
  const isPublicRoute = publicRoutes.some((route) => path.includes(route));

  // Define your media queries
  const isMobile = useMediaQuery({ maxWidth: 767 }); // screens smaller than 768px
  const isVerySmallDevice = useMediaQuery({ maxWidth: 400 }); // screens smaller than 400px

  // handler
  const toggleCollapsed = () => {
    if (isMobile) {
      setCollapsed((prev) => !prev);
    }
  };

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
    if (integrations?.length > 0) {
      const types: IntegrationType[] = Array.from(
        new Set(integrations.map((tmp: IntegrationDto) => tmp.type))
      );
      dispatch(setIntegrationTypesSlice(types));
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

  const getWorkspaces = async () => {
    const res: GetWorkspaceListWithUserDto = await userAPI.getWorkspaceList();
    if (res.user) {
      dispatch(
        setUserSlice({ ...res.user, role: res.user.activeUserWorkspace?.role })
      );
      const tmpUser = res.user;
      if (tmpUser?.status === "ONBOARD") {
        !path.includes("onBoarding") && router.push("/onBoarding");
      } else if (tmpUser?.status === "ACTIVE") {
        path.includes("onBoarding") && router.push("/taskList");
      }
      res.workspaces && dispatch(setWorkspacesSlice(res.workspaces));
    } else {
      const errorRes: any = res;
      errorRes?.error?.message && message.error(errorRes?.error?.message);
    }
    if (res.pages) {
      dispatch(setReportPages(res.pages));
    }
    setLoading(false);
  };

  // Side Effect
  useEffect(() => {
    const connectSocket = async () => {
      const getCookie = GetCookie("access_token");
      getCookie && !connectedSocket && (await initializeSocket(getCookie));
    };
    let timeout: NodeJS.Timeout;
    timeout =
      !isPublicRoute && !connectedSocket && setTimeout(connectSocket, 2000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!isPublicRoute) {
      userInfo?.activeWorkspace && initialLoading();
    }
  }, [userInfo?.activeWorkspace.id]);

  useEffect(() => {
    let myTimeout: NodeJS.Timeout;
    const getSyncStatus = async () => {
      const res = await userAPI.syncStatus();

      res && dispatch(setSyncStatus(res));
      if (res.status === "IN_PROGRESS") {
        dispatch(setSyncRunning(true));
        myTimeout = setTimeout(getSyncStatus, 5000);
      } else if (res.status === "DONE") {
        syncRunning && message.success("Sync Completed");
        dispatch(setSyncRunning(false));
      } else if (
        res.status === AuthorizationErrorMessage.INVALID_JIRA_REFRESH_TOKEN
      ) {
        dispatch(setSyncRunning(false));
        dispatch(setAuthorizationSlice({ type: "JIRA", value: true }));
      } else if (
        res.status === AuthorizationErrorMessage.INVALID_OUTLOOK_REFRESH_TOKEN
      ) {
        dispatch(setSyncRunning(false));
        dispatch(setAuthorizationSlice({ type: "OUTLOOK", value: true }));
      }
    };

    if (!publicRoutes.includes(router.pathname)) {
      if (syncRunning && userInfo?.activeWorkspace) {
        myTimeout = setTimeout(getSyncStatus, 5000);
      }
    }

    return () => clearTimeout(myTimeout);
  }, [syncRunning, publicRoutes.some((route) => path.includes(route))]);

  useEffect(() => {
    if (userInfo?.status === "ONBOARD") {
      !path.includes("onBoarding") && router.push("/onBoarding");
    } else if (userInfo?.status === "ACTIVE") {
      path.includes("onBoarding") && router.push("/taskList");
    }

    !["/inviteLink", "/socialLogin/redirect"].some((route) =>
      path.includes(route)
    ) && deleteFromLocalStorage("invitationCode");

    if (!isPublicRoute && !path.includes("socialLogin")) {
      if (!(workspacesList?.length > 0)) {
        setLoading(true);
        getWorkspaces();
      } else setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (!isPublicRoute && !path.includes("socialLogin")) {
      setLoading(true);
      getWorkspaces();
    }
  }, [reloadWorkspace]);

  return (
    <>
      <Layout style={layoutStyle}>
        {loading && !path.includes("socialLogin") && !isPublicRoute ? (
          <div className="h-screen">
            <Spin
              spinning={loading && !isPublicRoute}
              tip={"Loading..."}
              className="inset-0 m-auto h-full"
            >
              <div className="h-screen" />
            </Spin>
          </div>
        ) : (
          <div className="flex h-full w-full">
            <Head>
              <link rel="icon" href="/images/bsIcon.png" />
              <title>Tracker 23</title>
            </Head>
            {!isPublicRoute && !path.includes("onBoarding") && (
              <div
                className={classNames(
                  `hidden h-screen md:block min-w-[${
                    reportInEdit ? "350px" : "250px"
                  }] max-w-[${reportInEdit ? "350px" : "250px"}]`
                )}
              >
                {reportInEdit ? (
                  <ReportSettings />
                ) : (
                  <SideMenu toggleCollapsed={toggleCollapsed} />
                )}
              </div>
            )}

            {!isPublicRoute && !path.includes("onBoarding") && (
              <Drawer
                key="left"
                placement="left"
                onClose={toggleCollapsed}
                closable={isVerySmallDevice}
                maskClosable={!Boolean(reportInEdit)}
                width={reportInEdit ? "350px" : "250px"}
                open={collapsed || (isMobile && Boolean(reportInEdit))}
                styles={{
                  body: {
                    margin: 0,
                    padding: 0,
                  },
                }}
                className={classNames(
                  `hidden h-screen sm:block min-w-[${
                    reportInEdit ? "350px" : "250px"
                  }] max-w-[${reportInEdit ? "350px" : "250px"}]`
                )}
              >
                {reportInEdit ? (
                  <ReportSettings />
                ) : (
                  <SideMenu toggleCollapsed={toggleCollapsed} />
                )}
              </Drawer>
            )}
            {userInfo?.activeWorkspace ||
            path.includes("socialLogin") ||
            isPublicRoute ? (
              <div
                className={classNames(
                  "flex max-h-screen w-full flex-col overflow-auto overflow-y-auto bg-white"
                )}
              >
                {!isPublicRoute &&
                  !path.includes("onBoarding") &&
                  !noNavbar.some((route) => path.includes(route)) && (
                    <Navbar
                      collapsed={collapsed}
                      toggleCollapsed={toggleCollapsed}
                    />
                  )}
                <div className="h-full min-h-max w-full">{children}</div>
              </div>
            ) : (
              <div
                className={classNames("flex w-full flex-col overflow-y-auto")}
              >
                <Navbar
                  collapsed={collapsed}
                  toggleCollapsed={toggleCollapsed}
                />
                <NoActiveWorkspace
                  className={classNames("", {
                    "px-8": !isPublicRoute && !path.includes("onBoarding"),
                  })}
                />
              </div>
            )}
          </div>
        )}
      </Layout>
      <ToastContainer
        pauseOnHover
        closeOnClick
        autoClose={8000}
        draggable={false}
        newestOnTop={false}
        position="top-right"
        hideProgressBar={false}
      />
    </>
  );
};

export default ValidUserLayout;

// import Head from "next/head";
// import classNames from "classnames";
// import { useRouter } from "next/router";
// import { ToastContainer } from "react-toastify";
// import { useMediaQuery } from "react-responsive";
// import { message, Spin, Layout, Drawer } from "antd";
// import { ReactNode, useEffect, useState } from "react";

// // Models
// import { GetWorkspaceListWithUserDto } from "models/workspaces";
// import { IntegrationDto, IntegrationType } from "models/integration";

// // Components
// import Navbar from "@/components/navbar";
// import SideMenu from "@/components/sideMenu";
// import NoActiveWorkspace from "@/components/workspaces/noActiveWorkSpace";
// import ReportSettings from "@/components/report/components/reportSettings";

// // Service
// import { userAPI } from "APIs";
// import { noNavbar, publicRoutes } from "utils/constants";

// // Storage
// import {
//   setIntegrationsSlice,
//   setIntegrationTypesSlice,
// } from "@/storage/redux/integrationsSlice";
// import { RootState } from "@/storage/redux/store";
// import { setUserSlice } from "@/storage/redux/userSlice";
// import { deleteFromLocalStorage } from "@/storage/storage";
// import { setPriorities } from "@/storage/redux/prioritySlice";
// import { setReportPages } from "@/storage/redux/reportsSlice";
// import { setProjectsSlice } from "@/storage/redux/projectsSlice";
// import { useAppDispatch, useAppSelector } from "@/storage/redux";
// import { setSettingsReducer } from "@/storage/redux/settingsSlice";
// import { setWorkspacesSlice } from "@/storage/redux/workspacesSlice";
// import { setNotifications } from "@/storage/redux/notificationsSlice";
// import { setSyncRunning, setSyncStatus } from "@/storage/redux/syncSlice";

// import "react-toastify/dist/ReactToastify.css";

// const layoutStyle = {
//   overflow: "hidden",
//   width: "100%",
//   maxWidth: "100%",
//   height: "100vh",
//   minHeight: "100vh",
// };

// const ValidUserLayout = ({ children }: { children: ReactNode }) => {
//   const router = useRouter();
//   const dispatch = useAppDispatch();

//   // Define your media queries
//   const isVerySmallDevice = useMediaQuery({ maxWidth: 400 }); // screens smaller than 400px
//   const isMobile = useMediaQuery({ maxWidth: 767 }); // screens smaller than 768px

//   const userInfo = useAppSelector((state: RootState) => state.userSlice.user);
//   const syncRunning = useAppSelector(
//     (state: RootState) => state.syncStatus.syncRunning
//   );
//   const integrationsSlice = useAppSelector(
//     (state: RootState) => state.integrations.integrations
//   );
//   const notificationsSlice = useAppSelector(
//     (state: RootState) => state.notificationsSlice.notifications
//   );

//   const reloadWorkspace = useAppSelector(
//     (state: RootState) => state.workspacesSlice.reload
//   );
//   const projectStatuses = useAppSelector(
//     (state: RootState) => state.projectList.projects
//   );
//   const workspacesList = useAppSelector(
//     (state: RootState) => state.workspacesSlice.workspaces
//   );
//   const reportInEdit = useAppSelector(
//     (state: RootState) => state.reportsSlice.reportInEdit
//   );

//   // State
//   const [loading, setLoading] = useState(true);
//   const [collapsed, setCollapsed] = useState(false);
//   const [syncing, setSyncing] = useState(syncRunning);

//   // Constant
//   const path = router.asPath;
//   const isPublicRoute = publicRoutes.some((route) => path.includes(route));

//   // handler
//   const toggleCollapsed = () => {
//     if (isMobile) {
//       setCollapsed((prev) => !prev);
//     }
//   };

//   const getProjectWiseStatues = async () => {
//     if (!projectStatuses) {
//       {
//         const res = await userAPI.getIntegratedProjectStatuses();
//         res && dispatch(setProjectsSlice(res));
//       }
//     }
//   };

//   const getIntegrations = async () => {
//     const integrations =
//       integrationsSlice?.length > 0
//         ? integrationsSlice
//         : await userAPI.getIntegrations();
//     if (!(integrationsSlice?.length > 0) && integrations) {
//       dispatch(setIntegrationsSlice(integrations));
//       integrations?.length > 0 && getProjectWiseStatues();
//     }
//     if (integrations?.length > 0) {
//       const types: IntegrationType[] = Array.from(
//         new Set(integrations.map((tmp: IntegrationDto) => tmp.type))
//       );
//       dispatch(setIntegrationTypesSlice(types));
//     }
//   };

//   const getNotifications = async () => {
//     const notifications = await userAPI.getNotifications();
//     if (!(notificationsSlice?.length > 0) && notifications) {
//       dispatch(setNotifications(notifications));
//     }
//   };

//   const getSettings = async () => {
//     const res = await userAPI.getWorkspaceSettings();
//     res && dispatch(setSettingsReducer(res));
//   };

//   const getProjects = async () => {
//     const res = await userAPI.getIntegratedProjectStatuses();
//     res && dispatch(setProjectsSlice(res));
//     res && dispatch(setPriorities(res));
//   };

//   const initialLoading = async () => {
//     await getIntegrations();
//     await getNotifications();
//     await getSettings();
//     await getProjects();
//   };

//   const getWorkspaces = async () => {
//     const res: GetWorkspaceListWithUserDto = await userAPI.getWorkspaceList();
//     if (res.user) {
//       dispatch(
//         setUserSlice({ ...res.user, role: res.user.activeUserWorkspace?.role })
//       );
//       const tmpUser = res.user;
//       if (tmpUser?.status === "ONBOARD") {
//         !path.includes("onBoarding") && router.push("/onBoarding");
//       } else if (tmpUser?.status === "ACTIVE") {
//         path.includes("onBoarding") && router.push("/taskList");
//       }
//       res.workspaces && dispatch(setWorkspacesSlice(res.workspaces));
//     } else {
//       const errorRes: any = res;
//       errorRes?.error?.message && message.error(errorRes?.error?.message);
//     }
//     if (res.pages) {
//       dispatch(setReportPages(res.pages));
//     }
//     setLoading(false);
//   };

//   // Side Effect
//   useEffect(() => {
//     if (!isPublicRoute) {
//       userInfo?.activeWorkspace && initialLoading();
//     }
//   }, [userInfo?.activeWorkspace.id]);

//   useEffect(() => {
//     let myTimeout: NodeJS.Timeout;
//     const getSyncStatus = async () => {
//       const res = await userAPI.syncStatus();
//       res && dispatch(setSyncStatus(res));
//       if (res.status === "IN_PROGRESS") {
//         dispatch(setSyncRunning(true));
//         myTimeout = setTimeout(getSyncStatus, 5000);
//       } else if (res.status === "DONE") {
//         syncing && message.success("Sync Completed");
//         dispatch(setSyncRunning(false));
//       }
//     };

//     if (!publicRoutes.includes(router.pathname)) {
//       if (syncRunning && userInfo?.activeWorkspace) {
//         myTimeout = setTimeout(getSyncStatus, 5000);
//       }
//     }

//     return () => clearTimeout(myTimeout);
//   }, [syncing, publicRoutes.some((route) => path.includes(route))]);

//   useEffect(() => {
//     if (syncRunning !== syncing) setSyncing(syncRunning);
//   }, [syncing, syncRunning]);

//   useEffect(() => {
//     if (userInfo?.status === "ONBOARD") {
//       !path.includes("onBoarding") && router.push("/onBoarding");
//     } else if (userInfo?.status === "ACTIVE") {
//       path.includes("onBoarding") && router.push("/taskList");
//     }

//     !["/inviteLink", "/socialLogin/redirect"].some((route) =>
//       path.includes(route)
//     ) && deleteFromLocalStorage("invitationCode");

//     if (!isPublicRoute && !path.includes("socialLogin")) {
//       if (!(workspacesList?.length > 0)) {
//         setLoading(true);
//         getWorkspaces();
//       } else setLoading(false);
//     }
//   }, [path]);

//   useEffect(() => {
//     if (!isPublicRoute && !path.includes("socialLogin")) {
//       setLoading(true);
//       getWorkspaces();
//     }
//   }, [reloadWorkspace]);

//   return (
//     <>
//       <Layout style={layoutStyle}>
//         {loading && !path.includes("socialLogin") && !isPublicRoute ? (
//           <div className="h-screen">
//             <Spin
//               spinning={loading && !isPublicRoute}
//               tip={"Loading..."}
//               className="inset-0 m-auto h-full"
//             >
//               <div className="h-screen" />
//             </Spin>
//           </div>
//         ) : (
//           <div className="flex h-full w-full">
//             <Head>
//               <link rel="icon" href="/images/bsIcon.png" />
//               <title>Tracker 23</title>
//             </Head>
//             {!isPublicRoute && !path.includes("onBoarding") && (
//               <div
//                 className={classNames(
//                   `hidden h-screen md:block min-w-[${
//                     reportInEdit ? "350px" : "250px"
//                   }] max-w-[${reportInEdit ? "350px" : "250px"}]`
//                 )}
//               >
//                 {reportInEdit ? (
//                   <ReportSettings />
//                 ) : (
//                   <SideMenu toggleCollapsed={toggleCollapsed} />
//                 )}
//               </div>
//             )}

//             {!isPublicRoute && !path.includes("onBoarding") && (
//               <Drawer
//                 key="left"
//                 placement="left"
//                 onClose={toggleCollapsed}
//                 closable={isVerySmallDevice}
//                 maskClosable={!Boolean(reportInEdit)}
//                 width={reportInEdit ? "350px" : "250px"}
//                 open={collapsed || (isMobile && Boolean(reportInEdit))}
//                 style={{
//                   margin: 0,
//                   padding: 0,
//                 }}
//                 styles={{
//                   body: {
//                     margin: 0,
//                     padding: 0,
//                   },
//                 }}
//                 className={classNames(
//                   `hidden h-screen sm:block min-w-[${
//                     reportInEdit ? "350px" : "250px"
//                   }] max-w-[${reportInEdit ? "350px" : "250px"}]`
//                 )}
//               >
//                 {reportInEdit ? (
//                   <ReportSettings />
//                 ) : (
//                   <SideMenu toggleCollapsed={toggleCollapsed} />
//                 )}
//               </Drawer>
//             )}
//             {userInfo?.activeWorkspace ||
//             path.includes("socialLogin") ||
//             isPublicRoute ? (
//               <div
//                 className={classNames(
//                   "flex max-h-screen w-full flex-col overflow-auto overflow-y-auto bg-white"
//                 )}
//               >
//                 {!isPublicRoute &&
//                   !path.includes("onBoarding") &&
//                   !noNavbar.some((route) => path.includes(route)) && (
//                     <Navbar
//                       collapsed={collapsed}
//                       toggleCollapsed={toggleCollapsed}
//                     />
//                   )}
//                 <div className="h-full min-h-max w-full">{children}</div>
//               </div>
//             ) : (
//               <div
//                 className={classNames("flex w-full flex-col overflow-y-auto")}
//               >
//                 <Navbar
//                   collapsed={collapsed}
//                   toggleCollapsed={toggleCollapsed}
//                 />
//                 <NoActiveWorkspace
//                   className={classNames("", {
//                     "px-8": !isPublicRoute && !path.includes("onBoarding"),
//                   })}
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </Layout>
//       <ToastContainer
//         pauseOnHover
//         closeOnClick
//         autoClose={8000}
//         draggable={false}
//         newestOnTop={false}
//         position="top-right"
//         hideProgressBar={false}
//       />
//     </>
//   );
// };

// export default ValidUserLayout;
