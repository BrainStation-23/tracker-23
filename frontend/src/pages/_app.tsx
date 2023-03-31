import CustomLayout from "@/components/layout/layout";
import "@/styles/globals.css";
import {  Spin } from "antd";
import Axios from "axios";
import { config } from "config";
import type { AppProps } from "next/app";
import Head from "next/head";
import { useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { publicRoutes, whiteListEmails } from "utils/constants";
import { getLocalStorage } from "@/storage/storage";
import { useEffect } from "react";
import InvalidUserPage from "@/components/invalidUser";

// Axios.defaults.baseURL = process?.env?.NEXT_PUBLIC_API_PREFIX_REST;
// Axios.defaults.baseURL =
//   "http://ec2-54-172-94-212.compute-1.amazonaws.com:3000";
Axios.defaults.baseURL = config?.baseUrl;
export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [validUser, setValidUser] = useState(true);
  const [loading, setLoading] = useState(true);
  const url = router.asPath;
  const userDetails = getLocalStorage("userDetails");

  console.log("🚀 ~ file: _app.tsx:21 ~ App ~ router:", url);
  if (!publicRoutes.some((route) => url.includes(route))) {
    console.log(
      ">>>>>>>>>>",
      url,
      whiteListEmails.includes(userDetails?.email)
    );
  }
  useEffect(() => {
    if (!publicRoutes.some((route) => url.includes(route))) {
      console.log(
        ">>>>>>>>>>",
        url,
        whiteListEmails.includes(userDetails?.email)
      );
      whiteListEmails.includes(userDetails?.email) ? "" : setValidUser(false);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <>
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
    </>
  );
}
