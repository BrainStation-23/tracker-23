import React from "react";
import { Button, Checkbox, Form, Input } from "antd";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { userAPI } from "APIs";
import { GetCookie } from "@/services/cookie.service";
import Line from "../dashboard/charts/MultiValueAxesChart";

const LoginForm: React.FC = () => {
  const router = useRouter();
  const signIn = async (values: any) => {
    console.log(values);
    const data = await userAPI.login(values);

    console.log(
      "🚀 ~ file: loginForm.tsx:12 ~ signIn ~ data",
      data,
      GetCookie("access_token")
    );
    if (GetCookie("access_token")) router.push("/");
  };

  const onFinish = async (values: any) => {
    console.log("Success:", values);
    await signIn(values);
    // router.push("/taskList");
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Form
      name="basic"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      className="max-w-xl mx-auto"
    >
      <Form.Item
        label="Email"
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
        <Input type="email" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="remember"
        valuePropName="checked"
        wrapperCol={{ offset: 8, span: 16 }}
      >
        <Checkbox>Remember me</Checkbox>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit" className="bg-blue-600">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
