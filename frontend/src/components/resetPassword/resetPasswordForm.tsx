import { Form, Input, message } from "antd";
import { userAPI } from "APIs";
import { ResetPasswordDto } from "models/auth";
import { useRouter } from "next/router";
import React from "react";

const ResetPasswordForm = () => {
  const router = useRouter();

  const { token } = router.query;
  if (router.isReady && typeof token != "string") router.push("/login");

  const signIn = async (values: ResetPasswordDto) => {
    console.log(values);
    if (typeof token === "string") {
      const res = await userAPI.resetPassword(token, values);
      console.log("🚀 ~ file: ResetPasswordForm.tsx:16 ~ signIn ~ res:", res);
      res && message.success("successfully Updated");
    } else message.error("Update failed");
    router.push("/login");
  };

  const onFinish = async (values: any) => {
    console.log("Success:", values);
    // setIsModalOpen(true);
    try {
      await signIn(values);
    } catch (error) {}
    // setIsModalOpen(false);
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
      className="mx-auto w-full"
    >
      {/* <Form.Item
        // label="Email"
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
        <Input
          //   type="email"
          placeholder="Email"
          className="flex w-full rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </Form.Item> */}
      <Form.Item
        name="password"
        required
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password
          placeholder="Password"
          minLength={6}
          className="flex rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        rules={[
          { required: true, message: "Please re-input your password!" },
          ({ getFieldValue }) => ({
            validator(_, value) {
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
      </Form.Item>

      <Form.Item>
        <button className="flex w-full flex-none items-center justify-center rounded-lg border-2 border-black bg-black px-3 py-2 font-medium text-white md:px-4 md:py-3">
          Update Password
        </button>
      </Form.Item>
    </Form>
  );
};

export default ResetPasswordForm;
