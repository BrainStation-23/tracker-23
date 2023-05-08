import React from "react";
import { Button, Form, Input, message } from "antd";
import { useState } from "react";
import { useRouter } from "next/router";
import { userAPI } from "../../../../APIs/index";
type Props = {
  setIsModalOpen: Function;
};
const RegistrationForm = ({ setIsModalOpen }: Props) => {
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
    setIsModalOpen(true);
    const userRegistered = await userAPI.registerUser(temp);
    setIsModalOpen(false);

    if (userRegistered) {
      message.success("Singed up Successfully");
      router.push("/login");
    } else {
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
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onValuesChange={(e) => setEmailStatus("validating")}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        name="firstName"
        rules={[{ required: true, message: "Please input your First Name!" }]}
      >
        <Input
          placeholder="First Name"
          className="flex w-full rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </Form.Item>
      <Form.Item
        name="lastName"
        rules={[{ required: true, message: "Please input your Last Name!" }]}
      >
        <Input
          placeholder="Last Name"
          className="flex w-full rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </Form.Item>

      <Form.Item
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
        // help="Something breaks the rule."
      >
        <Input
          type="email"
          id="validating"
          placeholder="Email"
          className="flex w-full rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </Form.Item>

      <Form.Item
        name="password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password
          placeholder="Password"
          className="flex rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </Form.Item>

      <Form.Item
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
        <Input.Password
          placeholder="Re-type Password"
          className="flex rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
        />
      </Form.Item>

      <Form.Item>
        <button className="flex w-full flex-none items-center justify-center rounded-lg border-2 border-black bg-black px-3 py-2 font-medium text-white md:px-4 md:py-3">
          Sign up
        </button>
      </Form.Item>
    </Form>
  );
};

export default RegistrationForm;
