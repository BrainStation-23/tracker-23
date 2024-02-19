import { Spin } from "antd";
import Head from "next/head";
import { useEffect, useState } from "react";

import InvalidUserPage from "@/components/invalidUser";
import CustomLayout from "@/components/layout/layout";

import { Providers } from "@/storage/redux/provider";
import { getLocalStorage } from "@/storage/storage";

import type { AppProps } from "next/app";
import { UserDto } from "models/user";

import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const [loading, setLoading] = useState(true);
  const [validUser, setValidUser] = useState(false);

  useEffect(() => {
    const user: UserDto = getLocalStorage("userDetails");
    if (user.approved) {
      setValidUser(true);
    }
    setLoading(false);
  }, []);

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
                <title>Tracker 23</title>
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
