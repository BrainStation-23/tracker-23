import { updateWorkspaceSlice } from "@/storage/redux/workspacesSlice";
import { userAPI } from "APIs";
import { Form, Input, message } from "antd";
import { CreateWorkspaceModel } from "models/apiParams";
import { WorkspaceDto } from "models/workspaces";
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
  setIsModalOpen,
  setSelectedWorkspace,
}: Props) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const onFinish = async (values: CreateWorkspaceModel) => {
    const res = await userAPI.updateWorkspace(values, workspace.id);
    if (res.name) dispatch(updateWorkspaceSlice(res));
    setSelectedWorkspace(null);
    message.success("Workspace updated Successfully");
    setIsModalOpen(false);
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
