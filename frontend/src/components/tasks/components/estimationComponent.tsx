import EditIconSvg from "@/assets/svg/EditIconSvg";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { Form, Input, Tooltip } from "antd";
import { TaskDto } from "models/tasks";
import { useState } from "react";
interface Props {
  children: any;
  task: TaskDto;
}

const EstimationComponent = ({ children, task }: Props) => {
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const onFinish = async (values: any) => {
    console.log(
      "🚀 ~ file: estimationComponent.tsx:5 ~ [form] ~ values:",
      values
    );
  };

  const onReset = () => {
    form.resetFields();
  };
  const initialValues = {
    estimation: 1,
  };
  return (
    <div className={`group cursor-default`}>
      {editing ? (
        <Form
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          initialValues={initialValues}
          className="my-auto flex items-center gap-2"
        >
          <Form.Item
            name="estimation"
            // initialValue={2}
            // label="Estimation (in hours)"
            // style={{ width: "70px" }}
            className="m-0 flex w-[70px] items-center"
            rules={[{ required: true }]}
          >
            <Input type="number" placeholder="hours" className="my-auto" />
          </Form.Item>
          <Tooltip title="Save">
            <button type="submit" className="m-0 h-min p-0">
              <CheckCircleOutlined
                style={{
                  fontSize: "20px",
                  color: "#00A3DE",
                }}
              />
            </button>
          </Tooltip>
          <Tooltip title="Cancel">
            <button
              type="submit"
              className="m-0 h-min p-0"
              onClick={() => setEditing(false)}
            >
              <CloseCircleOutlined
                style={{
                  fontSize: "20px",
                  color: "#F26956",
                }}
              />
            </button>
          </Tooltip>
        </Form>
      ) : (
        <div className=" flex justify-center gap-2">
          {children}{" "}
          <Tooltip title="Edit Estimation">
            <div
              className={`hidden cursor-pointer transition-all duration-1000 group-hover:block`}
              onClick={() => setEditing(!editing)}
            >
              <EditIconSvg />
            </div>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export default EstimationComponent;
