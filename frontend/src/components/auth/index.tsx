import AuthLeftPanel from "./authLeftPanel";
import LoginPanel from "./loginPanel";

const AuthPage = () => {
  return (
    <div
      className="grid h-screen w-full grid-cols-2"
      style={{
        borderColor: "#E0E0E0", // Change the border color to red
      }}
    >
      <AuthLeftPanel />
      <LoginPanel />
    </div>
  );
};

export default AuthPage;
