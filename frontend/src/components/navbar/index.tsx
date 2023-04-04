import { GetCookie } from "@/services/cookie.service";
import {
  Avatar,
  Button,
  Dropdown,
  Menu,
  MenuProps,
  message,
  Space,
} from "antd";
import LogOutButton from "../logOutButton";
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

function Navbar() {
  const [userDetails, setUserDetails] = useState<LoginResponseDto>();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [syncing, setSyncing] = useState(false);
  const router = useRouter();
  const path = router.asPath;
  const btnText = path === "/login" ? "Register" : "Login";
  const access_token = GetCookie("access_token");
  const [pageInfo, setPageInfo] = useState([]);
  useEffect(() => {
    const tmp = getLocalStorage("userDetails");
    if (!userDetails && tmp) setUserDetails(tmp);
  }, [userDetails, path]);
  const items: MenuProps["items"] = [
    {
      key: "3",
      icon: (
        <div>
          <button
            // type="ghost"
            className={`flex w-full items-center ${
              syncing ? "border-green-500 text-green-500" : ""
            }`}
            onClick={async () => {}}
          >
            <div className="ml-3 flex items-center gap-1">
              <ProfileIconSvg />{" "}
              <span className="text-[15px] font-semibold"> Account</span>
            </div>
          </button>
        </div>
      ),
    },
    {
      key: "1",
      icon: (
        <div className="w-[200px]">
          <Button
            type="ghost"
            className={`flex w-full items-center ${
              syncing ? "border-green-500 text-green-500" : ""
            }`}
            onClick={async () => {
              setSyncing(true);
              await syncTasks();
            }}
          >
            <SyncOutlined spin={syncing} />{" "}
            <span className="text-[15px] font-semibold">Sync</span>
          </Button>
        </div>
      ),
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
  const syncTasks = async () => {
    try {
      const res = await userAPI.syncTasks();
      message.success("Sync Successful");
    } catch (error) {
      message.error("Error syncing tasks");
    } finally {
      setSyncing(false);
    }
  };
  const menuProps = {
    items,
    onClick: () => {},
  };

  const dropdownRender = (menu: React.ReactNode) => (
    <div className="float-right">{menu}</div>
  );
  return (
    <div className=" mb-2 flex h-16 w-full items-center justify-between px-5">
      <div className="py-6 text-xl text-blue-500  hover:text-green-500">
        {sideMenuOptions?.map(
          (option) =>
            router.asPath.includes(option.link) && (
              <div
                key={Math.random()}
                className={`flex items-center gap-2 rounded-lg px-1 text-black `}
              >
                <div className=" stroke-black">{option.icon}</div>
                <div className={`text-base font-semibold`}>{option.title}</div>
              </div>
            )
        )}
        {pageInfo[0] && (
          <div
            className={`flex items-center gap-2 rounded-lg px-1 text-black `}
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
          <div
            className="flex h-9 w-9 cursor-pointer items-center justify-center"
            style={{
              border: "1px solid #ECECED",
              borderRadius: "8px",
            }}
          >
            <BellIconSvg />
          </div>
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
                    <div className="font-normal">Project Manager</div>
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
