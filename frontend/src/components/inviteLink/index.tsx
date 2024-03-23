import { Spin } from "antd";
import { userAPI } from "APIs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import AuthLeftPanel from "@/components/auth/components/authLeftPanel";
import { setLocalStorage } from "@/storage/storage";

import LoginPanelInviteLink from "./components/loginPanelInviteLink";
import RegistrationPanelInviteLink from "./components/registrationPanelInviteLink";

const InviteLinkComponent = () => {
  const router = useRouter();
  const [validUser, setValidUser] = useState(true);
  const [onlySocialLogin, setOnlySocialLogin] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState<any>();

  const getUserInfoFromCode = async () => {
    const code = router?.query?.code;
    setLocalStorage("invitationCode", code);
    const res: any = code && (await userAPI.getInvitedUserInfo(code as string));
    if (res) {
      setUserInfo(res);
      setValidUser(res.isValidUser);
      setOnlySocialLogin(res.onlySocialLogin);
    }
    setDataLoaded(true);
  };
  useEffect(() => {
    router.isReady && getUserInfoFromCode();
  }, [router.isReady]);
  return (
    <Spin spinning={!dataLoaded}>
      <div
        className="grid h-screen w-full grid-cols-2 px-8 pt-2"
        style={{
          borderColor: "#E0E0E0", // Change the border color to red
        }}
      >
        <AuthLeftPanel />
        {dataLoaded &&
          (validUser ? (
            <LoginPanelInviteLink
              email={userInfo?.email}
              onlySocialLogin={onlySocialLogin}
            />
          ) : (
            <RegistrationPanelInviteLink email={userInfo?.email} />
          ))}
      </div>
    </Spin>
  );
};

export default InviteLinkComponent;
