import { GetCookie } from "@/services/cookie.service";
import { DoubleRightOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import Navbar from "../navbar";
import SideBar from "../navbar/sideBar";
import SideMenu from "../navbar/sideMenu";
import TopBar from "../navbar/topBar";
import GlobalClock from "../stopWatch/globalClock";

const CustomLayout = ({ children }: any) => {
  const router = useRouter();
  const [showSideBar, setShowSideBar] = useState<boolean>(false);
  const path = router.asPath;
  const publicRoutes = ["/login", "/registration"];
  // if (path.includes("/socialLogin/googleRedirectCB")) return <>{children}</>;

  return (
    <>
      <div className="flex">
        {!publicRoutes.some((route) => path.includes(route)) && (
          <div className="w-[300px]">
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
        <div className="flex w-full flex-col overflow-y-auto ml-5">
          <Navbar />
          <div
            className={` h-full w-full bg-white px-8 pt-2 pb-3 ${
              !path.includes("/login") && !path.includes("/register")
                ? "pl-8 "
                : "mx-auto flex flex-col"
            } `}
            // style={{ height: "calc(100vh - 80px)" }}
          >
            <GlobalClock />
            {/* <TopBar /> */}
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
