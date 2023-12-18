import { Checkbox, Form } from "antd";
import { userAPI } from "APIs";
import { useRouter } from "next/router";
import React from "react";

import { GetCookie } from "@/services/cookie.service";

import MyFormItem from "../../common/form/MyFormItem";
import MyInput from "../../common/form/MyInput";
import MyPasswordInput from "../../common/form/MyPasswordInput";
import MyLink from "../../common/link/MyLink";
import Line from "../../dashboard/charts/lineChart";

type Props = {
  setIsModalOpen: Function;
  email?: string;
};

const LoginForm = ({ setIsModalOpen, email }: Props) => {
  const router = useRouter();
  const signIn = async (values: any) => {
    console.log(values);
    const data = await userAPI.login(values);
    console.log("🚀 ~ file: loginForm.tsx:23 ~ signIn ~ data:", data);
    if (data?.status === "ONBOARD" && GetCookie("access_token"))
      router.push("/onBoarding");
    else if (GetCookie("access_token")) router.push("/onBoarding");
    !data && setIsModalOpen(false);
  };

  const onFinish = async (values: any) => {
    console.log("Success:", values);
    setIsModalOpen(true);
    const res = await signIn(values);
    console.log("🚀 ~ file: loginForm.tsx:32 ~ onFinish ~ res:", res);
    // router.push("/taskList");
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="basic"
      // labelCol={{ span: 8 }}
      // wrapperCol={{ span: 16 }}
      initialValues={{ remember: true, email }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      // autoComplete="off"
      layout="vertical"
      labelAlign="left"
      requiredMark={false}
      className="mx-auto w-full pb-0 "
    >
      <MyFormItem
        label="Email Address"
        className=" w-full"
        name="email"
        colon={false}
        rules={[
          { required: true, message: "Please input your email!" },
          {
            type: "email",
            min: 0,
            max: 200,
            message: "Please input a valid email.",
          },
        ]}
      >
        <MyInput
          disabled={email?.length > 0}
          type="text"
          placeholder="Enter your email"
        />
      </MyFormItem>
      <div className="relative">
        <MyFormItem
          label="Enter your password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <MyPasswordInput placeholder="Password" />
        </MyFormItem>
      </div>

      <div className="flex items-center justify-between">
        <MyFormItem
          name="remember"
          valuePropName="checked"
          // wrapperCol={{ offset: 8, span: 16 }}
          className="m-0"
        >
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
