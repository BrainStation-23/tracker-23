import { Form, Input, message, Select } from "antd";
import { userAPI } from "APIs";

import PrimaryButton from "@/components/common/buttons/primaryButton";

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
          <Option value="ADMIN">Admin</Option>
          <Option value="USER">User</Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <PrimaryButton htmlType="submit">Send Invitation</PrimaryButton>
      </Form.Item>
    </Form>
  );
};

export default InviteToWorkspace;
