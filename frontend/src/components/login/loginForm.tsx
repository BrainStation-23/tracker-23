import React from "react";
import { Button, Checkbox, Form, Input } from "antd";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { userAPI } from "APIs";
import { GetCookie } from "@/services/cookie.service";
import Line from "../dashboard/charts/lineChart";
import Link from "next/link";

type Props = {
  setIsModalOpen: Function;
};

const LoginForm = ({ setIsModalOpen }: Props) => {
  const router = useRouter();
  const signIn = async (values: any) => {
    console.log(values);
    const data = await userAPI.login(values);

    console.log(
      "🚀 ~ file: loginForm.tsx:12 ~ signIn ~ data",
      data,
      GetCookie("access_token")
    );
    if (GetCookie("access_token")) router.push("/taskList");
  };

  const onFinish = async (values: any) => {
    console.log("Success:", values);
    setIsModalOpen(true);
    try {
      await signIn(values);
    } catch (error) {}
    setIsModalOpen(false);
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
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      className="mx-auto w-full pb-0"
    >
      <Form.Item
        // label="Email"
        className=" w-full"
        name="email"
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
        <Input
          type="text"
          placeholder="Email"
          className="flex w-full rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
        {/* <Input type="email" className="" /> */}
      </Form.Item>

      <Form.Item
        // label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
        className="relative"
      >
        <Input.Password
          placeholder="Password"
          className="flex rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
        <div className="absolute right-0 text-end">
          <Link
            href="/forgotPassword"
            className="text-xs font-medium hover:text-[#070eff]"
          >
            Forgot your Password?
          </Link>
        </div>
      </Form.Item>

      {/* <Form.Item
        name="remember"
        valuePropName="checked"
        wrapperCol={{ offset: 8, span: 16 }}
      >
        <Checkbox>Remember me</Checkbox>
      </Form.Item> */}

      <Form.Item className="mb-0">
        <button className="mt-5 flex w-full flex-none items-center justify-center rounded-lg border-2 border-black bg-black px-3 py-2 font-medium text-white md:px-4 md:py-3">
          Login
        </button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
