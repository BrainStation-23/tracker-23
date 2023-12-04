import { updateWorkspaceSlice } from "@/storage/redux/workspacesSlice";
import { userAPI } from "APIs";
import { Button, Checkbox, Form, Input, message } from "antd";
import { CreateWorkspaceModel } from "models/apiParams";
import { WorkspaceDto } from "models/workspaces";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import PrimaryButton from "@/components/common/buttons/primaryButton";
type Props = {
  workspace: WorkspaceDto;
  setSelectedWorkspace: Function;
  setIsModalOpen: Function;
};
const EditWorkspace = ({
  workspace,
  setSelectedWorkspace,
  setIsModalOpen,
}: Props) => {
  console.log(
    "🚀 ~ file: editWorkspace.tsx:14 ~ EditWorkspace ~ workspace:",
    workspace
  );
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [switchWorkspace, setSwitchWorkspace] = useState(false);

  const onFinish = async (values: CreateWorkspaceModel) => {
    console.log("Form values:", values);
    const res = await userAPI.updateWorkspace(values, workspace.id);
    if (res.name) dispatch(updateWorkspaceSlice(res));
    setSelectedWorkspace(null);
    message.success("Workspace updated Successfully");
    setIsModalOpen(false);
    // Here you can perform actions based on the form values, e.g., create a workspace.
    // If switchWorkspace is true, you can switch to the newly created workspace.
  };
  useEffect(() => {
    form.setFieldValue("name", workspace.name);
  }, [workspace]);
  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        label="Workspace Name"
        name="name"
        rules={[
          {
            required: true,
            message: "Please enter a workspace name",
          },
        ]}
      >
        <Input />
      </Form.Item>
      {/* <Form.Item name="changeWorkspace" valuePropName="checked">
                <Checkbox
                    onChange={(e) => setSwitchWorkspace(e.target.checked)}
                >
                    Switch to this workspace
                </Checkbox>
            </Form.Item> */}
      <div className="mx-auto flex w-[200px] justify-between">
        <Form.Item>
          <PrimaryButton htmlType="submit">Save</PrimaryButton>
        </Form.Item>
        <Form.Item>
          <PrimaryButton onClick={() => setIsModalOpen(false)}>
            Cancel
          </PrimaryButton>
        </Form.Item>
      </div>
    </Form>
  );
};

export default EditWorkspace;
