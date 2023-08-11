import { addWorkspaceSlice } from "@/storage/redux/workspacesSlice";
import { userAPI } from "APIs";
import { Button, Checkbox, Form, Input, message } from "antd";
import { CreateWorkspaceModel } from "models/apiParams";
import { useState } from "react";
import { useDispatch } from "react-redux";
type Props = {
  setIsModalOpen: Function;
};
const AddNewWorkspace = ({ setIsModalOpen }: Props) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [switchWorkspace, setSwitchWorkspace] = useState(false);

  const onFinish = async (values: CreateWorkspaceModel) => {
    console.log("Form values:", values);
    const res = await userAPI.createWorkspace(values);
    message.success("Workspace created Successfully");
    dispatch(addWorkspaceSlice(res));
    setIsModalOpen(false);
    // Here you can perform actions based on the form values, e.g., create a workspace.
    // If switchWorkspace is true, you can switch to the newly created workspace.
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        label="Workspace Name"
        name="name"
        rules={[{ required: true, message: "Please enter a workspace name" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item name="changeWorkspace" valuePropName="checked">
        <Checkbox onChange={(e) => setSwitchWorkspace(e.target.checked)}>
          Switch to newly created workspace
        </Checkbox>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Create Workspace
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddNewWorkspace;
