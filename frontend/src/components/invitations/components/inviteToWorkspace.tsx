import { userAPI } from "APIs";
import { Button, Form, Input, message, Select } from "antd";
import { useState } from "react";

const { Option } = Select;
type Props = {
  setIsModalOpen: Function;
};
const InviteToWorkspace = ({ setIsModalOpen }: Props) => {
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    console.log("Form values:", values);

    const res = await userAPI.sendWorkspaceInvitation(values);
    console.log("🚀 ~ file: inviteToWorkspace.tsx:16 ~ onFinish ~ res:", res);

    res && message.success("Invitation sent successfully");
    setIsModalOpen(false);
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        label="Email"
        name="email"
        rules={[
          { required: true, message: "Please enter an email" },
          { type: "email", message: "Please enter a valid email" },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Role"
        name="role"
        rules={[{ required: true, message: "Please select a role" }]}
      >
        <Select>
          <Option value="admin">Admin</Option>
          <Option value="user">User</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Send Invitation
        </Button>
      </Form.Item>
    </Form>
  );
};

export default InviteToWorkspace;
