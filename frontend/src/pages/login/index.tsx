import SocialLogin from "@/components/login/socialLogin";
import Link from "next/link";
import LoginForm from "../../components/login/loginForm";

const Login = () => {
  return (
    <div className="pt-32">
      <LoginForm />
      <div className="mx-auto w-max p-2">
        {`Don't have an account? ... `}{" "}
        <Link href="/registration" className="hover:text-blue-500">
          Register
        </Link>
      </div>
      <SocialLogin />
    </div>
  );
};
export default Login;
