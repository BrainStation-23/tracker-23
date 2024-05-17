import Link from "next/link";
import ResetPasswordForm from "@/components/resetPassword/resetPasswordForm";
import Image from "next/image";
import Logo from "@/assets/images/logo.png";

const ResetPasswordPage = () => {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-row">
        <div className="m-4 hidden flex-col justify-between bg-blue-600 text-white lg:flex lg:max-w-sm lg:p-8 xl:max-w-lg xl:p-12">
          <div className="flex items-center justify-start space-x-3">
            <Image alt="tracker 23 logo" src={Logo} />
          </div>
          <div className="space-y-5">
            <h1 className="font-extrabold lg:text-3xl xl:text-5xl xl:leading-snug">
              Track your time now and discover new experiences
            </h1>

            <p className="text-lg">don&apos;t have an account?</p>
            <Link
              href="/registration"
              className="inline-block flex-none rounded-lg border-2 border-black bg-black px-4 py-3 font-medium text-white"
            >
              Create account here
            </Link>
          </div>
          <p className="font-medium">© {new Date().getFullYear()} Tracker 23</p>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center px-10">
          <div className="flex w-full items-center justify-end py-4 lg:hidden">
            <div className="flex items-center space-x-2">
              <span>Not a member? </span>
              <Link
                href="/registration"
                className="font-medium text-[#070eff] underline"
              >
                Sign up now
              </Link>
            </div>
          </div>
          <div className="m-auto flex h-screen w-full items-center md:w-[400px]">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
