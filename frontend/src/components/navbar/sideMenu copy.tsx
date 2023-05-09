import { AiOutlineLogout } from "react-icons/ai";
import { BiImport } from "react-icons/bi";
import { TiExport } from "react-icons/ti";
import { UnorderedListOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import { userAPI } from "APIs";

const SideMenu = () => {
  const router = useRouter();
  const handleLogOut = async () => {
    console.log("logging out");
    const loggedOut = userAPI.logout();
    if (loggedOut) router.push("/login");
  };
  const SideMenuOption = ({ option, active }: any) => {
    const router = useRouter();
    return (
      <li
        className={`m-5 mx-auto flex h-7 w-7 scale-110 flex-col items-center justify-center rounded px-1 hover:cursor-pointer hover:bg-indigo-500 hover:text-white ${
          active ? "bg-indigo-500 text-white" : "text-gray-400"
        }`}
        onClick={() => {
          router.push(option.link);
        }}
      >
        {option.icon}
      </li>
    );
  };
  return (
    <div className="flex h-screen items-center justify-center bg-indigo-700">
      <div className="flex h-full w-16 flex-col justify-between">
        <div>
          {" "}
          <div
            className="flex items-center justify-center rounded-md p-4 text-white hover:cursor-pointer"
            onClick={() => {
              router.push("/");
            }}
          >
            T23
          </div>
          <div className=" rounded-md text-gray-200">
            <ul>
              {sideMenuOptions?.map((option) => (
                <SideMenuOption
                  key={Math.random()}
                  option={option}
                  active={router.asPath.includes(option.link)}
                />
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-center justify-center pb-5 text-white">
          <div
            className="scale-110 rounded-full  p-1 hover:cursor-pointer hover:bg-indigo-500"
            onClick={handleLogOut}
          >
            <AiOutlineLogout />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideMenu;

export const sideMenuOptions = [
  { link: "/taskList", title: "Tasks Page", icon: <UnorderedListOutlined /> },
  // { link: "/dashboard", title: "Dashboard Page" },
  {
    link: "/integrations",
    title: "Integrations Page",
    icon: <BiImport />,
  },
  {
    link: "/exports",
    title: "Exports",
    icon: <TiExport />,
  },
  // { link: "/onBoarding", title: "OnBoarding Page" },
];
