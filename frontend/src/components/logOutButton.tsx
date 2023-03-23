import { RemoveAllCookies, RemoveCookie } from "@/services/cookie.service";
import { LogoutOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useRouter } from "next/router";
// import { LogOut } from "../APIs";
import { userAPI } from "../../APIs/index";

const LogOutButton = () => {
  const router = useRouter();
  const handleLogOut = async () => {
    console.log("logging out");
    const loggedOut = await userAPI.logout();
    if (loggedOut) router.push("/login");
  };
  return (
    <Button className="" onClick={() => handleLogOut()}>
      <LogoutOutlined /> Log out
    </Button>
  );
};

export default LogOutButton;
