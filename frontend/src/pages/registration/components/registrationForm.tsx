import React from "react";
import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { useRouter } from "next/router";
import { userAPI } from "../../../../APIs/index";

const RegistrationForm: React.FC = () => {
  const router = useRouter();

  const [emailStatus, setEmailStatus] = useState<
    "" | "success" | "warning" | "error" | "validating" | undefined
  >("");
  const onFinish = async (values: any) => {
    console.log(
      "🚀 ~ file: registrationForm.tsx:11 ~ onFinish ~ values",
      values
    );
    const temp = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      password: values.password,
    };
    const userRegistered = await userAPI.registerUser(temp);
    if (userRegistered) router.push("/login");
    else {
      message.error("email already Used");
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
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onValuesChange={(e) => setEmailStatus("validating")}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="First Name"
        name="firstName"
        rules={[{ required: true, message: "Please input your First Name!" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Last Name"
        name="lastName"
        rules={[{ required: true, message: "Please input your Last Name!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        validateFirst={true}
        validateStatus={emailStatus}
        hasFeedback
        rules={[
          { required: true, message: "Please input a valid email!" },
          {
            type: "email",
            whitespace: false,
            min: 0,
            max: 200,
            message: `Please input a valid email.`,
          },
          // ({ getFieldValue }) => ({
          //   async validator(_, value) {
          //     let v;
          //     if (emailStatus === "validating" && value?.length >= 5) {
          //       v = await CheckEmailValidity(value);
          //       if (v) {
          //         setEmailStatus("success");
          //         return Promise.resolve();
          //       }
          //       if (!v) {
          //         setEmailStatus("error");
          //         return Promise.reject(new Error("Email already in use!"));
          //       }
          //     }
          //   },
          // }),
        ]}
        // help="Something breaks the rule."
      >
        <Input
          placeholder="I'm the content is being validated"
          type="email"
          id="validating"
        />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="Re-type Password"
        name="passwordRe"
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
        <Input.Password />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit" className="bg-blue-600">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegistrationForm;
