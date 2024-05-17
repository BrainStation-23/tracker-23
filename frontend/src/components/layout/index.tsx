import { Spin } from "antd";
import Head from "next/head";
import { ReactNode, useEffect, useState } from "react";

import ValidUserLayout from "./ValidUserLayout";
import InvalidUserPage from "../invalidUser";

import { getLocalStorage } from "@/storage/storage";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/router";
import { publicRoutes } from "utils/constants";

const Layout = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [approvedUser, setApprovedUser] = useState(true);
  const user = useAppSelector((state: RootState) => state.userSlice.user);

  useEffect(() => {
    const userInfo = getLocalStorage("userDetails");
    const path = router.asPath;
    if (
      !userInfo?.access_token &&
      !publicRoutes.some((route) => path.includes(route))
    ) {
      router.push("/login");
    }
    if (
      userInfo?.approved &&
      userInfo?.access_token &&
      publicRoutes.some((route) => path.includes(route))
    ) {
      router.push("/taskList");
    }

    if (userInfo && userInfo.email && !userInfo.approved) {
      setApprovedUser(false);
    } else {
      setApprovedUser(true);
    }
    setIsLoading(false);
  }, [router, user]);

  return (
    <Spin spinning={isLoading}>
      <Head>
        <link rel="icon" href="/tracker_icon.png" />
        <title>Tracker 23</title>
      </Head>
      {approvedUser ? (
        <ValidUserLayout>{children}</ValidUserLayout>
      ) : (
        <InvalidUserPage />
      )}
    </Spin>
  );
};

export default Layout;
