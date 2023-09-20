import { userAPI } from "APIs";
import { Form, Input, message } from "antd";
import { ForgotPasswordDto } from "models/auth";
import { useRouter } from "next/router";
import React from "react";
import MyFormItem from "../../common/form/MyFormItem";
import MyInput from "@/components/common/form/MyInput";
import MyLink from "@/components/common/MyLink";

type Props = {
  setIsModalOpen: Function;
};

const ForgotPasswordForm = ({ setIsModalOpen }: Props) => {
  const router = useRouter();
  const signIn = async (values: ForgotPasswordDto) => {
    console.log(values);
    const res = await userAPI.forgotPassword(values);
    console.log("🚀 ~ file: forgotPasswordForm.tsx:16 ~ signIn ~ res:", res);
    router.push("/login");
    message.success(res.message);
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
      // autoComplete="off"
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
          //   type="email"
          placeholder="Enter your email"
          className="flex w-full rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </MyFormItem>

      <MyFormItem>
        <button className="flex w-full flex-none items-center justify-center rounded-lg border-2 border-black bg-black px-3 py-2 font-medium text-white md:px-4 md:py-3">
          Reset Password
        </button>
      </MyFormItem>
      <div className="flex items-center justify-center gap-2 2xl:text-lg">
        Back to
        <MyLink href="/login">Login</MyLink>
      </div>
    </Form>
  );
};

export default ForgotPasswordForm;
