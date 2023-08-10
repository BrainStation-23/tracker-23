import { userAPI } from "APIs";
import { Button, Checkbox, Form, Input } from "antd";
import { CreateWorkspaceModel } from "models/apiParams";
import { WorkspaceDto } from "models/workspaces";
import { useState } from "react";
type Props = {
    workspace: WorkspaceDto;
    setSelectedWorkspace: Function;
};
const EditWorkspace = ({ workspace, setSelectedWorkspace }: Props) => {
    const [form] = Form.useForm();
    const [switchWorkspace, setSwitchWorkspace] = useState(false);

    const onFinish = async (values: CreateWorkspaceModel) => {
        console.log("Form values:", values);
        const res = await userAPI.createWorkspace(values);
        console.log("🚀 ~ file: addNewWorkspace.tsx:13 ~ onFinish ~ res:", res);
        // Here you can perform actions based on the form values, e.g., create a workspace.
        // If switchWorkspace is true, you can switch to the newly created workspace.
    };

    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
                label="Workspace Name"
                name="name"
                initialValue={workspace.name}
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
            <div className="mx-auto flex w-[300px] justify-between">
                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Save
                    </Button>
                </Form.Item>
                <Form.Item>
                    <Button type="primary">Cancel</Button>
                </Form.Item>
            </div>
        </Form>
    );
};

export default EditWorkspace;
