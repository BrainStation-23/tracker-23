import { useRouter } from "next/router";

import AuthLeftPanel from "./components/authLeftPanel";
import ForgotPasswordPanel from "./components/forgotPasswordPanel";
import LoginPanel from "./components/loginPanel";
import RegistrationPanel from "./components/registrationPanel";

const AuthPage = () => {
  const router = useRouter();
  const path = router.asPath;
  return (
    <div className="h-screen w-full md:grid md:grid-cols-2">
      <AuthLeftPanel />
      {path.includes("login") && <LoginPanel />}
      {path.includes("forgotPassword") && <ForgotPasswordPanel />}
      {path.includes("registration") && <RegistrationPanel />}
    </div>
  );
};

export default AuthPage;
