import { Checkbox, Form, Input, message } from "antd";
import { userAPI } from "APIs";
import { CreateWorkspaceModel } from "models/apiParams";
import { useState } from "react";
import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import {
  addWorkspaceSlice,
  changeWorkspaceReloadStatusSlice,
} from "@/storage/redux/workspacesSlice";

type Props = {
  setIsModalOpen: Function;
  setIsModalLoading: Function;
};
const AddNewWorkspace = ({ setIsModalOpen, setIsModalLoading }: Props) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [switchWorkspace, setSwitchWorkspace] = useState(false);

  const onFinish = async (values: CreateWorkspaceModel) => {
    setIsModalLoading(true);
    console.log("Form values:", values);
    const res = await userAPI.createWorkspace(values);
    res && message.success("Workspace created Successfully");
    res && dispatch(addWorkspaceSlice(res));
    if (values.changeWorkspace) {
      message.success("Active Workspace Changed");
      dispatch(changeWorkspaceReloadStatusSlice());
    }
    setIsModalOpen(false);
    // Here you can perform actions based on the form values, e.g., create a workspace.
    // If switchWorkspace is true, you can switch to the newly created workspace.
    setIsModalLoading(false);
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
        <PrimaryButton htmlType="submit"> Create Workspace</PrimaryButton>
      </Form.Item>
    </Form>
  );
};

export default AddNewWorkspace;
