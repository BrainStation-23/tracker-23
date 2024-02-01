import { Form, message } from "antd";
import { userAPI } from "APIs";
import { ForgotPasswordDto } from "models/auth";
import { useRouter } from "next/router";
import React from "react";

import MyFormItem from "@/components/common/form/MyFormItem";
import MyInput from "@/components/common/form/MyInput";
import MyLink from "@/components/common/link/MyLink";

type Props = {
  setIsModalOpen: Function;
};

const ForgotPasswordForm = ({ setIsModalOpen }: Props) => {
  const router = useRouter();
  const signIn = async (values: ForgotPasswordDto) => {
    const res = await userAPI.forgotPassword(values);
    router.push("/login");
    message.success(res.message);
  };

  const onFinish = async (values: any) => {
    setIsModalOpen(true);
    try {
      await signIn(values);
    } catch (error) {}
    setIsModalOpen(false);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      requiredMark={false}
      layout="vertical"
      labelAlign="left"
      className="mx-auto w-full"
    >
      <MyFormItem
        label="Email Address"
        className=" w-full"
        name="email"
        rules={[
          {
            type: "email",
            min: 0,
            max: 200,
            message: "Please input a valid email.",
          },
          { required: true, message: "Please input your email!" },
        ]}
      >
        <MyInput
          placeholder="Enter your email"
          className="flex w-full rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </MyFormItem>

      <MyFormItem>
        <button className="flex w-full flex-none items-center justify-center rounded-lg border-2 border-black bg-black px-3 py-2 font-medium text-white md:px-4 md:py-3">
          Reset Password
        </button>
      </MyFormItem>
      <div className="flex items-center justify-center gap-2 2xl:text-base">
        Back to
        <MyLink href="/login">Login</MyLink>
      </div>
    </Form>
  );
};

export default ForgotPasswordForm;
