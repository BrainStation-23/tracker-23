import { useRouter } from "next/router";

import AuthLeftPanel from "./components/authLeftPanel";
import ForgotPasswordPanel from "./components/forgotPasswordPanel";
import LoginPanel from "./components/loginPanel";
import RegistrationPanel from "./components/registrationPanel";

const AuthPage = () => {
  const router = useRouter();
  const path = router.asPath;
  return (
    <div
      className="grid h-screen w-full grid-cols-2"
      style={{
        borderColor: "#E0E0E0",
      }}
    >
      <AuthLeftPanel />
      {path.includes("login") && <LoginPanel />}
      {path.includes("forgotPassword") && <ForgotPasswordPanel />}
      {path.includes("registration") && <RegistrationPanel />}
    </div>
  );
};

export default AuthPage;
