import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import AuthLeftPanel from "../auth/components/authLeftPanel";
import LoginPanelInviteLink from "./components/loginPanelInviteLink";
import RegistrationPanelInviteLink from "./components/registrationPanelInviteLink";
import { userAPI } from "APIs";
import { Spin } from "antd";

const InviteLinkComponent = () => {
  const router = useRouter();
  const path = router.asPath;
  const [validUser, setValidUser] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState<any>();

  const getUserInfoFromCode = async () => {
    const code = router?.query?.code;
    const res: any = code && (await userAPI.getInvitedUserInfo(code as string));
    if (res) {
      setUserInfo(res);
      setValidUser(res.isValidUser);
    }
    setDataLoaded(true);
  };
  useEffect(() => {
    router.isReady && getUserInfoFromCode();
    console.log(
      "🚀 ~ file: index.tsx:30 ~ useEffect ~ router.isReady:",
      router.isReady
    );
  }, [router.isReady]);
  return (
    <Spin spinning={!dataLoaded}>
      <div
        className="grid h-screen w-full grid-cols-2"
        style={{
          borderColor: "#E0E0E0", // Change the border color to red
        }}
      >
        <AuthLeftPanel />
        {dataLoaded &&
          (validUser ? (
            <LoginPanelInviteLink email={userInfo?.email} />
          ) : (
            <RegistrationPanelInviteLink email={userInfo?.email} />
          ))}
      </div>
    </Spin>
  );
};

export default InviteLinkComponent;
