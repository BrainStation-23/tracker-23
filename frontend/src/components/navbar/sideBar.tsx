import { DoubleLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useRouter } from "next/router";
import { menuOptions } from "utils/constants";

type Props = {
  showSideBar: boolean;
  setShowSideBar: Function;
};
const SideBar = ({ showSideBar, setShowSideBar }: Props) => {
  const router = useRouter();
  return (
    <div
      className={`fixed duration-500 origin-left w-48 px-2 ${
        showSideBar ? " delay-100 scale-x-100" : " scale-x-0"
      }  overflow-hidden z-100 bg-blue-800 text-white`}
      style={{ height: "calc(100vh - 0px)" }}
    >
      <div className="relative">
        <div
          className="absolute right-0 p-4 pr-2 hover:text-green-500"
          onClick={() => setShowSideBar(!showSideBar)}
        >
          <DoubleLeftOutlined />
        </div>
      </div>
      <div
        className="text-2xl text-blue-500 hover:text-green-500 py-6"
        onClick={() => {
          router.push("/");
        }}
      >
        Overseer
      </div>
      <div className="flex flex-col">
        {menuOptions.map((option) => (
          <SideMenuOption
            key={Math.random()}
            option={option}
            active={router.asPath.includes(option.link)}
          />
        ))}
      </div>
    </div>
  );
};

const SideMenuOption = ({ option, active = false }: any) => {
  return (
    <div
      className={`p-1 pl-4 ${
        active ? "bg-blue-500" : ""
      } hover:bg-blue-500 rounded-lg`}
    >
      <Link href={option.link}>{option.title}</Link>
    </div>
  );
};

export default SideBar;
