import { Form, Input, message } from "antd";
import { userAPI } from "APIs/index";
import { useRouter } from "next/router";
import React, { useState } from "react";

import MyFormItem from "@/components/common/form/MyFormItem";
import MyLink from "@/components/common/link/MyLink";

type Props = {
  setIsModalOpen: Function;
  email?: string;
};
const RegistrationFormInvitedUser = ({ setIsModalOpen, email }: Props) => {
  const router = useRouter();
  const code: any = router?.query?.code;

  const onFinish = async (values: any) => {
    const temp = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
    };
    setIsModalOpen(true);
    const userRegistered = await userAPI.registerUserFromInvite({
      ...temp,
      code,
    });
    setIsModalOpen(false);
    if (userRegistered) {
      message.success("Singed up Successfully");
      router.push("/taskList");
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
    errorInfo &&
      errorInfo.errorFields.forEach((ef: any) => {
        message.error(ef.errors[0]);
      });
  };

  return (
    <Form
      name="basic"
      initialValues={{ remember: true, email }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      layout="vertical"
      labelAlign="left"
      requiredMark={false}
      className="mx-auto w-full pb-0 "
    >
      <MyFormItem
        label="First Name"
        name="firstName"
        rules={[{ required: true, message: "Please input your First Name!" }]}
      >
        <Input
          placeholder="First Name"
          className="flex w-full rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </MyFormItem>
      <MyFormItem
        label="Last Name"
        name="lastName"
        rules={[{ required: true, message: "Please input your Last Name!" }]}
      >
        <Input
          placeholder="Last Name"
          className="flex w-full rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </MyFormItem>

      <MyFormItem
        label="Email Address"
        name="email"
        validateFirst={true}
        rules={[
          { required: true, message: "Please input a valid email!" },
          {
            type: "email",
            whitespace: false,
            min: 0,
            max: 200,
            message: `Please input a valid email.`,
          },
        ]}
      >
        <Input
          type="email"
          id="validating"
          disabled={email?.length > 0}
          placeholder="Enter your email"
          className="flex w-full rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </MyFormItem>

      <MyFormItem
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password
          placeholder="Enter your password"
          className="flex rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </MyFormItem>

      <MyFormItem
        label="Re-type Password"
        name="passwordRe"
        rules={[
          { required: true, message: "Please re-input your password!" },
          ({ getFieldValue }: any) => ({
            validator(_: any, value: any) {
              if (!value || getFieldValue("password") === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error("Passwords does not match!"));
            },
          }),
        ]}
      >
        <Input.Password
          placeholder="Re-type Password"
          className="flex rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </MyFormItem>

      <MyFormItem>
        <button className="flex w-full flex-none items-center justify-center rounded-lg border-2 border-black bg-black px-3 py-2 font-medium text-white md:px-4 md:py-3">
          Sign up
        </button>
      </MyFormItem>
      <div className="flex items-center justify-center gap-2 2xl:text-base">
        Already have account?
        <MyLink href="/login">Login</MyLink>
      </div>
    </Form>
  );
};

export default RegistrationFormInvitedUser;
