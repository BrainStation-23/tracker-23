import classNames from "classnames";
import { useRouter } from "next/router";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import Navbar from "../navbar";
import SideMenu from "../navbar/sideMenu";
import GlobalClock from "../stopWatch/globalClock";

const CustomLayout = ({ children }: any) => {
	const router = useRouter();
	console.log("🚀 ~ file: layout.tsx:14 ~ CustomLayout ~ router:", router);
	const [showSideBar, setShowSideBar] = useState<boolean>(false);
	const path = router.asPath;
	const publicRoutes = ["/login", "/registration"];
	const isPublicRoute = publicRoutes.includes(router.pathname);
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
				<div className="flex w-full flex-col overflow-y-auto">
					{!isPublicRoute && <Navbar />}

					<div
						className={classNames("h-full w-full bg-white", {
							"pl-8": !isPublicRoute,
						})}
					>
						{!isPublicRoute && <GlobalClock />}
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
