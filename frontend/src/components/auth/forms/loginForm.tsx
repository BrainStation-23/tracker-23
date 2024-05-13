import { Checkbox, Form, message } from "antd";
import { userAPI } from "APIs";
import { useRouter } from "next/router";
import React from "react";

import MyFormItem from "@/components/common/form/MyFormItem";
import MyInput from "@/components/common/form/MyInput";
import MyPasswordInput from "@/components/common/form/MyPasswordInput";
import MyLink from "@/components/common/link/MyLink";
import { GetCookie } from "@/services/cookie.service";

type Props = {
  setIsModalOpen: Function;
  email?: string;
};

const LoginForm = ({ setIsModalOpen, email }: Props) => {
  const router = useRouter();

  const signIn = async (values: any) => {
    try {
      const res = await userAPI.login(values);
      if (!res) throw Error("Login failed!");
      if (window.gtag) {
        window.gtag("event", "login", {
          method: "System",
        });
      }
      if (res?.status === "ONBOARD" && GetCookie("access_token")) {
        router.push("/onBoarding");
      } else if (GetCookie("access_token")) {
        router.push("/taskList");
      }
    } catch (err) {
      message.error("Something went wrong!!. Try again later.");
    } finally {
      setIsModalOpen(false);
    }
  };

  const onFinish = async (values: any) => {
    setIsModalOpen(true);
    await signIn(values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="basic"
      layout="vertical"
      labelAlign="left"
      onFinish={onFinish}
      requiredMark={false}
      className="mx-auto w-full pb-0"
      onFinishFailed={onFinishFailed}
      initialValues={{ remember: true, email }}
    >
      <MyFormItem
        label="Email Address"
        className=" w-full"
        name="email"
        colon={false}
        rules={[
          { required: true, message: "Please input your email!" },
          {
            min: 0,
            max: 200,
            type: "email",
            message: "Please input a valid email.",
          },
        ]}
      >
        <MyInput
          type="text"
          disabled={email?.length > 0}
          placeholder="Enter your email"
        />
      </MyFormItem>
      <div className="relative">
        <MyFormItem
          name="password"
          label="Enter your password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <MyPasswordInput placeholder="Password" />
        </MyFormItem>
      </div>

      <div className="flex items-center justify-between">
        <MyFormItem name="remember" valuePropName="checked" className="m-0">
          <Checkbox>
            <span className="2xl:text-lg">Remember me for 30 days</span>
          </Checkbox>
        </MyFormItem>
        <div className="m-0">
          <MyLink href="/forgotPassword">Forgot your Password?</MyLink>
        </div>
      </div>
      <MyFormItem className="m-4">
        <button className="flex w-full flex-none items-center justify-center rounded-lg border-2 border-black bg-black px-3 py-2 font-medium text-white md:px-4 md:py-3">
          Login
        </button>
      </MyFormItem>
      <div className="flex items-center justify-center gap-2 2xl:text-base">
        Not a member?
        <MyLink href="/registration">Create Account</MyLink>
      </div>
    </Form>
  );
};

export default LoginForm;
