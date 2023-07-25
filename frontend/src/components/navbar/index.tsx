import { GetCookie } from "@/services/cookie.service";
import {
  Avatar,
  Button,
  Dropdown,
  Menu,
  MenuProps,
  message,
  Space,
  Tooltip,
} from "antd";
import LogOutButton from "../logout/logOutButton";
import { useRouter } from "next/router";
import { getLocalStorage } from "@/storage/storage";
import { useEffect, useState } from "react";
import { LoginResponseDto } from "models/auth";
import BellIconSvg from "@/assets/svg/BellIconSvg";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { sideMenuOptions } from "./sideMenu";
import { SyncOutlined } from "@ant-design/icons";
import { userAPI } from "APIs";
import ProfileIconSvg from "@/assets/svg/ProfileIconSvg";
import { useAppDispatch, useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { setSyncRunning, setSyncStatus } from "@/storage/redux/syncSlice";
import NotificationSection from "./components/notificationSection";

function Navbar() {
  const [userDetails, setUserDetails] = useState<LoginResponseDto>();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const syncing = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );

  const router = useRouter();
  const path = router.asPath;
  const btnText = path === "/login" ? "Register" : "Login";
  const access_token = GetCookie("access_token");
  const [pageInfo, setPageInfo] = useState([]);

  const dispatch = useAppDispatch();
  const syncFunction = async () => {
    dispatch(setSyncRunning(true));
    const res = await userAPI.syncTasks();
    res && dispatch(setSyncStatus(res));
  };
  const userInfo = useAppSelector((state: RootState) => state.userSlice.user);
  useEffect(() => {
    const tmp = getLocalStorage("userDetails");
    if (!userDetails && tmp) setUserDetails(tmp);
  }, [userDetails, path]);
  const items: MenuProps["items"] = [
    // {
    //   key: "3",
    //   icon: (
    //     <div>
    //       <button
    //         // type="ghost"
    //         className={`flex w-full items-center`}
    //         onClick={async () => {}}
    //       >
    //         <div className="ml-3 flex items-center gap-1">
    //           <ProfileIconSvg />{" "}
    //           <span className="text-[15px] font-semibold"> Account</span>
    //         </div>
    //       </button>
    //     </div>
    //   ),
    // },
    {
      key: "1",
      icon: (
        <div className="w-[200px]">
          <Button
            type="ghost"
            className={`flex w-full items-center ${
              syncing ? "text-green-500" : ""
            }`}
            // onClick={async () => {
            //   syncFunction();
            // }}
          >
            <SyncOutlined spin={syncing} />{" "}
            <span className="text-[15px] font-semibold">Sync</span>
          </Button>
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
      <div className="py-6 text-xl text-blue-500  hover:text-green-500">
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
          {/* <Dropdown
            menu={menuProps}
            trigger={["click"]}
            overlayStyle={{
              width: "100px",
              backgroundColor: "red",
            }}
            overlayClassName='w-32'
            className="flex w-[300px] items-center rounded bg-gray-50 p-2 hover:bg-gray-100"
          > */}
          <div>
            <Dropdown
              menu={menuProps}
              dropdownRender={dropdownRender}
              trigger={["click"]}
              className="transition-all delay-1000 duration-1000"
              overlayClassName="duration-1000 delay-1000 transition-all"
            >
              <div
                className="flex w-[300px] items-center justify-between"
                // onClick={() => {
                //   !dropdownOpen && setDropdownOpen(true);
                // }}
              >
                <div className="flex items-center gap-2">
                  {userDetails?.picture ? (
                    <Avatar
                      src={userDetails.picture}
                      alt="N"
                      className="h-[40px] w-[40px]"
                    />
                  ) : (
                    <Avatar
                      src={
                        "https://st3.depositphotos.com/15437752/19006/i/600/depositphotos_190061104-stock-photo-silhouette-male-gradient-background-white.jpg"
                      }
                      alt="N"
                      className="h-[40px] w-[40px]"
                    />
                  )}
                  <div className="flex flex-col text-sm">
                    <div className="font-semibold">
                      {userDetails?.firstName} {userDetails?.lastName}
                    </div>
                    <div className="font-normal">
                      {userInfo?.role ? userInfo?.role : "Project Manager"}
                    </div>
                  </div>
                </div>
                <div
                  className="flex h-7 w-7 cursor-pointer items-center justify-center bg-[#ECECED]"
                  style={{
                    borderRadius: "8px",
                  }}
                >
                  {dropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
              </div>
            </Dropdown>
          </div>
          {/* </Dropdown> */}
          {/* <LogOutButton /> */}
        </div>
      )}
    </div>
  );
}

export default Navbar;
