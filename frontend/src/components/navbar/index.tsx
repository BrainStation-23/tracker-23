import { GetCookie } from "@/services/cookie.service";
import { Avatar, Button, Dropdown, MenuProps, Space } from "antd";
import LogOutButton from "../logOutButton";
import { useRouter } from "next/router";
import { getLocalStorage } from "@/storage/storage";
import { useEffect, useState } from "react";
import { LoginResponseDto } from "models/auth";
import BellIconSvg from "@/assets/svg/BellIconSvg";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { sideMenuOptions } from "./sideMenu";

function Navbar() {
  const [userDetails, setUserDetails] = useState<LoginResponseDto>();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
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
      key: "1",
      icon: <LogOutButton />,
    },
  ];
  const menuProps = {
    items,
    onClick: () => {},
  };
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
            onClick={() => {
              setDropdownOpen(!dropdownOpen);
            }}
          >
            <Dropdown
              menu={menuProps}
              trigger={["click"]}
              overlayClassName="mt-5"
              open={dropdownOpen}
            >
              {dropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
            </Dropdown>
          </div>
          {/* <LogOutButton /> */}
        </div>
      )}
    </div>
  );
}

export default Navbar;
