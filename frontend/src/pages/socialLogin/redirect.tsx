import { SetCookie } from "@/services/cookie.service";
import { setLocalStorage } from "@/storage/storage";
import { userAPI } from "APIs";
import { message, Spin } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const GoogleCallbackPage = () => {
  const router = useRouter();
  const getUserData = async (code: string) => {
    const res = await userAPI.googleLogin(code);
    console.log("🚀 ~ file: redirect.tsx:14 ~ getUserData ~ res:", res);
    if (res?.access_token) {
      SetCookie("access_token", res?.access_token);
      setLocalStorage("access_token", res?.access_token);
      setLocalStorage("userDetails", res);
      message.success("Successfully Logged in");
      router.push("/taskList");
    } else {
      message.error("Login Failed");
      router.push("/login");
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(router.asPath.split("?")[1]);
    const code = urlParams.get("code");
    if (typeof code === "string") {
      getUserData(code);
    } else if (!code) router.push("/login");
  }, []);

  return (
    <div className="flex w-full justify-center p-40">
      <Spin tip="Signing in" size="large" className="scale-150"></Spin>
    </div>
  );
};

export default GoogleCallbackPage;
