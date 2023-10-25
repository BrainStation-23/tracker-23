import { useRouter } from "next/router";
import { useState } from "react";

import AuthLeftPanel from "../auth/components/authLeftPanel";
import LoginPanelInviteLink from "./components/loginPanelInviteLink";
import RegistrationPanelInviteLink from "./components/registrationPanelInviteLink";

const InviteLinkComponent = () => {
  const router = useRouter();
  const path = router.asPath;
  const [validUser, setValidUser] = useState(false);
  const [userInfo, setUserInfo] = useState({
    email: "seefathimel1@gmail.com",
  });

  const getUserInfoFromCode = () => {
    return {
      email: "seefathimel1@gmail.com",
    };
  };
  return (
    <>
      <div
        className="grid h-screen w-full grid-cols-2"
        style={{
          borderColor: "#E0E0E0", // Change the border color to red
        }}
      >
        <AuthLeftPanel />
        {validUser ? (
          <LoginPanelInviteLink email={userInfo.email} />
        ) : (
          <RegistrationPanelInviteLink email={userInfo.email} />
        )}
      </div>
    </>
  );
};

export default InviteLinkComponent;
