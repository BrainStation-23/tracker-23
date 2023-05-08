/* eslint-disable react/no-unescaped-entities */
import BSLogoSvg from "@/assets/svg/BSLogoSvg";
import BSLogoWhiteSvg from "@/assets/svg/BSLogoWhiteSvg";
import { LoadingOutlined } from "@ant-design/icons";
import { Modal, Spin } from "antd";
import { config } from "config";
import Link from "next/link";
import { useState } from "react";
import LoginForm from "../login/loginForm";

export default function LoginV2() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="flex min-h-screen">
        <div className="flex w-full flex-row">
          <div className="m-4 hidden flex-col justify-between bg-blue-600 text-white lg:flex lg:max-w-sm lg:p-8 xl:max-w-lg xl:p-12">
            <div className="flex items-center justify-start space-x-3">
              {/* <span className="h-8 w-8 rounded-full bg-black"></span>
								<a href="#" className="text-xl font-medium">
									Tracker23
								</a> */}
              <BSLogoWhiteSvg />
              {/* <BSLogoSvg /> */}
            </div>
            <div className="space-y-5">
              <h1 className="font-extrabold lg:text-3xl xl:text-5xl xl:leading-snug">
                Track your time now and discover new experiences
              </h1>

              <p className="text-lg">don't have an account?</p>
              <Link
                href="/registration"
                className="inline-block flex-none rounded-lg border-2 border-black bg-black px-4 py-3 font-medium text-white"
              >
                Create account here
              </Link>
            </div>
            <p className="font-medium">© 2023 BrainStation 23</p>
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
            <div className="flex max-w-md flex-1  flex-col justify-center space-y-5">
              <div className="flex flex-col space-y-2 text-center">
                <h2 className="text-3xl font-bold md:text-4xl">
                  Sign in to account
                </h2>
                <p className="text-md md:text-xl">
                  Sign up or log in to start tracking your time
                </p>
              </div>
              <div className="flex max-w-md flex-col space-y-5">
                <LoginForm {...{ setIsModalOpen }} />
                {/* <input
									type="text"
									placeholder="Username"
									className="flex rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
								/>
								<button className="flex flex-none items-center justify-center rounded-lg border-2 border-black bg-black px-3 py-2 font-medium text-white md:px-4 md:py-3">
									Confirm with email
								</button> */}
                <div className="flex items-center justify-center">
                  <span className="w-full border border-black"></span>
                  <span className="px-4">Or</span>
                  <span className="w-full border border-black"></span>
                </div>
                <button className="relative flex flex-none items-center justify-center rounded-lg border-2 border-black px-3 py-2 font-medium md:px-4 md:py-3">
                  <Link href={`${config?.baseUrl}/auth/google`}>
                    <span className="absolute left-4">
                      <svg
                        width="24px"
                        height="24px"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlnsXlink="http://www.w3.org/1999/xlink"
                      >
                        <path
                          fill="#EA4335 "
                          d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
                        />
                        <path
                          fill="#34A853"
                          d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
                        />
                        <path
                          fill="#4A90E2"
                          d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
                        />
                      </svg>
                    </span>
                    <span onClick={() => setIsModalOpen(true)}>
                      Sign in with Google
                    </span>
                  </Link>
                </button>
              </div>
            </div>

            <div className="m-auto mb-16 flex flex-col justify-center text-center text-lg dark:text-slate-200 ">
              <p>Find us on social media</p>
              <div className="mt-4 flex flex-wrap items-center justify-center space-x-2">
                <a
                  href="https://www.linkedin.com/in/#/"
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-full transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="4.983"
                      cy="5.009"
                      r="2.188"
                      fill="currentColor"
                    ></circle>
                    <path
                      d="M9.237 8.855v12.139h3.769v-6.003c0-1.584.298-3.118 2.262-3.118 1.937 0 1.961 1.811 1.961 3.218v5.904H21v-6.657c0-3.27-.704-5.783-4.526-5.783-1.835 0-3.065 1.007-3.568 1.96h-.051v-1.66H9.237zm-6.142 0H6.87v12.139H3.095z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>

                <a
                  href="https://dribbble.com/#"
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-full transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.66 6.98a9.932 9.932 0 0 0-3.641-3.64C15.486 2.447 13.813 2 12 2s-3.486.447-5.02 1.34c-1.533.893-2.747 2.107-3.64 3.64S2 10.187 2 12s.446 3.487 1.34 5.02a9.924 9.924 0 0 0 3.641 3.64C8.514 21.553 10.187 22 12 22s3.486-.447 5.02-1.34a9.932 9.932 0 0 0 3.641-3.64C21.554 15.487 22 13.813 22 12s-.446-3.487-1.34-5.02zM12 3.66c2 0 3.772.64 5.32 1.919-.92 1.174-2.286 2.14-4.1 2.9-1.002-1.813-2.088-3.327-3.261-4.54A7.715 7.715 0 0 1 12 3.66zM5.51 6.8a8.116 8.116 0 0 1 2.711-2.22c1.212 1.201 2.325 2.7 3.34 4.5-2 .6-4.114.9-6.341.9-.573 0-1.006-.013-1.3-.04A8.549 8.549 0 0 1 5.51 6.8zM3.66 12c0-.054.003-.12.01-.2.007-.08.01-.146.01-.2.254.014.641.02 1.161.02 2.666 0 5.146-.367 7.439-1.1.187.373.381.793.58 1.26-1.32.293-2.674 1.006-4.061 2.14S6.4 16.247 5.76 17.5c-1.4-1.587-2.1-3.42-2.1-5.5zM12 20.34c-1.894 0-3.594-.587-5.101-1.759.601-1.187 1.524-2.322 2.771-3.401 1.246-1.08 2.483-1.753 3.71-2.02a29.441 29.441 0 0 1 1.56 6.62 8.166 8.166 0 0 1-2.94.56zm7.08-3.96a8.351 8.351 0 0 1-2.58 2.621c-.24-2.08-.7-4.107-1.379-6.081.932-.066 1.765-.1 2.5-.1.799 0 1.686.034 2.659.1a8.098 8.098 0 0 1-1.2 3.46zm-1.24-5c-1.16 0-2.233.047-3.22.14a27.053 27.053 0 0 0-.68-1.62c2.066-.906 3.532-2.006 4.399-3.3 1.2 1.414 1.854 3.027 1.96 4.84-.812-.04-1.632-.06-2.459-.06z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>

                <a
                  href="https://github.com/#"
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-full transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>
                <a
                  href="https://www.instagram.com/#/"
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-full transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>

                <a
                  href="https://twitter.com/#"
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-full transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z"
                      fill="currentColor"
                    ></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={isModalOpen}
        footer={null}
        closable={false}
        centered
        className="w-20 bg-transparent"
        maskStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <div className="flex h-40 flex-col items-center justify-center gap-4">
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            size="large"
          />
          <h1>Logging In</h1>
        </div>
      </Modal>
    </>
  );
}
