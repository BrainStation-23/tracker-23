import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

import { message, Spin } from "antd";
import { userAPI } from "APIs";
import Axios from "axios";
import { config } from "config";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { publicRoutes, whiteListEmails } from "utils/constants";

import InvalidUserPage from "@/components/invalidUser";
import CustomLayout from "@/components/layout/layout";
import { Providers } from "@/storage/redux/provider";
import { getLocalStorage } from "@/storage/storage";

import type { AppProps } from "next/app";
// Axios.defaults.baseURL = process?.env?.NEXT_PUBLIC_API_PREFIX_REST;
// Axios.defaults.baseURL =
//   "http://ec2-54-172-94-212.compute-1.amazonaws.com:3000";
Axios.defaults.baseURL = config?.baseUrl;
console.log(
  "🚀 ~ file: _app.tsx:23 ~ config , Axios.defaults:",
  config,
  Axios.defaults
);
Axios.interceptors.request.use(
  (config) => {
    const token = getLocalStorage("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

Axios.interceptors.response.use(undefined, async (error) => {
  const { status, data } = error.response;
  if (!error.response) {
    message.error("Backend Crashed");
  }
  if (data?.error?.message)
    message.error(
      data?.error?.message ? data?.error?.message : "Something Went Wrong"
    );
  if (status === 401) userAPI.logout();

  throw error.response;
});
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [validUser, setValidUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const url = router.asPath;
  const userDetails = getLocalStorage("userDetails");

  useEffect(() => {
    if (!publicRoutes.some((route) => url.includes(route))) {
      const email = userDetails?.email?.toLowerCase();
      whiteListEmails.includes(email) ? "" : setValidUser(false);
    } else if (!validUser) {
      setValidUser(true);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validUser, url, router]);
  return (
    <Providers>
      <Spin spinning={loading} size="large" className="pt-[50%]">
        {!loading && (
          <>
            {" "}
            {validUser ? (
              <CustomLayout>
                <Head>
                  <link rel="icon" href="/bsIcon.png" />
                  <title>Tracker23</title>
                </Head>{" "}
                <Component {...pageProps} />
              </CustomLayout>
            ) : (
              <InvalidUserPage />
            )}
          </>
        )}
      </Spin>
    </Providers>
  );
}
