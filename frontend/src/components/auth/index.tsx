import { useRouter } from "next/router";
import AuthLeftPanel from "./components/authLeftPanel";
import LoginPanel from "./components/loginPanel";

const AuthPage = () => {
  const router = useRouter();
  const path = router.asPath;
  console.log(
    "🚀 ~ file: index.tsx:8 ~ AuthPage ~ path:",
    path,
    path.includes("login")
  );
  return (
    <div
      className="grid h-screen w-full grid-cols-2"
      style={{
        borderColor: "#E0E0E0", // Change the border color to red
      }}
    >
      <AuthLeftPanel />
      {path.includes("login") && <LoginPanel />}
    </div>
  );
};

export default AuthPage;
