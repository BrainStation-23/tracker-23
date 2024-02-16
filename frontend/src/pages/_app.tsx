import { Spin } from "antd";
import { config } from "config";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { publicRoutes } from "utils/constants";

import InvalidUserPage from "@/components/invalidUser";
import CustomLayout from "@/components/layout/layout";

import { Providers } from "@/storage/redux/provider";
import { getLocalStorage } from "@/storage/storage";

import type { AppProps } from "next/app";
import { UserDto } from "models/user";

import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const url = router.asPath;
  const userDetails: UserDto = getLocalStorage("userDetails");

  const [loading, setLoading] = useState(true);
  const [validUser, setValidUser] = useState(true);

  useEffect(() => {
    if (!publicRoutes.some((route) => url.includes(route))) {
      if (typeof userDetails?.approved === "boolean")
        setValidUser(
          userDetails?.approved || userDetails?.email === config.adminMail
        );
      else setValidUser(true);
    } else if (!validUser) {
      setValidUser(true);
    }
    setLoading(false);
  }, [validUser, url, router]);

  return (
    <Providers>
      {loading ? (
        <Spin spinning={loading} size="large" className="pt-[50%]" />
      ) : (
        <>
          {validUser ? (
            <CustomLayout>
              <Head>
                <link rel="icon" href="/images/bsIcon.png" />
                <title>Tracker23</title>
              </Head>
              <Component {...pageProps} />
            </CustomLayout>
          ) : (
            <InvalidUserPage />
          )}
        </>
      )}
    </Providers>
  );
}
