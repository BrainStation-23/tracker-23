import React from "react";
import { Button, Checkbox, Form, Input } from "antd";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { userAPI } from "APIs";
import { GetCookie } from "@/services/cookie.service";
import Line from "../../dashboard/charts/lineChart";
import Link from "next/link";
import MyFormItem from "../../common/form/MyFormItem";
import MyLink from "../../common/MyLink";
import MyInput from "../../common/form/MyInput";
import MyPasswordInput from "../../common/form/MyPasswordInput";

type Props = {
  setIsModalOpen: Function;
};

const LoginForm = ({ setIsModalOpen }: Props) => {
  const router = useRouter();
  const signIn = async (values: any) => {
    console.log(values);
    const data = await userAPI.login(values);
    console.log("🚀 ~ file: loginForm.tsx:23 ~ signIn ~ data:", data);
    if (GetCookie("access_token")) router.push("/taskList");
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
      initialValues={{ remember: true }}
      onFinish={onFinish}
      layout="vertical"
      onFinishFailed={onFinishFailed}
      autoComplete="off"
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
        <MyInput type="text" placeholder="Enter your email" />
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
      <div className="flex items-center justify-center gap-2 2xl:text-lg">
        Not a member?
        <MyLink href="/forgotPassword">Create Account</MyLink>
      </div>
    </Form>
  );
};

export default LoginForm;
