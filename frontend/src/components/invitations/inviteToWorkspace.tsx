import { Form, Input, message, Select, Spin } from "antd";
import { userAPI } from "APIs";
import { useState } from "react";

import PrimaryButton from "@/components/common/buttons/primaryButton";

const { Option } = Select;
type Props = {
  setIsModalOpen: Function;
};
const InviteToWorkspace = ({ setIsModalOpen }: Props) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const onFinish = async (values: any) => {
    setLoading(true);
    const res = await userAPI.sendWorkspaceInvitation(values);
    if (res) {
      if (window.gtag) {
        window.gtag("event", "team_invite", {
          value: "team invitation",
        });
      }
      message.success("Invitation sent successfully");
    }
    setIsModalOpen(false);
    setLoading(false);
    form.resetFields();
  };

  return (
    <Spin spinning={loading}>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter an email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Please select a role" }]}
        >
          <Select placeholder="Slect a role">
            <Option value="ADMIN">Admin</Option>
            <Option value="USER">User</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <PrimaryButton htmlType="submit">Send Invitation</PrimaryButton>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default InviteToWorkspace;
