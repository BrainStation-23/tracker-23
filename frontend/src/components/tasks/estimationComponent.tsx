import { Form, InputNumber, Tooltip } from "antd";
import { TaskDto } from "models/tasks";
import { useState } from "react";

import EditIconSvg from "@/assets/svg/EditIconSvg";
import FormatTimeForSettings from "@/components/common/time/formatTimeForSettings";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

interface Props {
  task: TaskDto;
  handleEstimationChange: Function;
}

const EstimationComponent = ({ task, handleEstimationChange }: Props) => {
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const onFinish = async (values: any) => {
    if (Number(task.estimation) !== Number(values.estimation)) {
      const res = await handleEstimationChange(task, Number(values.estimation));

      if (res) {
        task.estimation = res.estimation;
      }
      setEditing(false);
    } else setEditing(false);
  };

  const onFinishFailed = (err: any) => {
    console.log(
      "🚀 ~ file: estimationComponent.tsx:32 ~ onFinishFailed ~ err:",
      err
    );
  };
  const initialValues = {
    estimation: Number(task.estimation),
  };

  return (
    <div
      className={`group cursor-default`}
      onClick={(event) => event.stopPropagation()}
    >
      {editing ? (
        <Form
          form={form}
          name="control-hooks"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          initialValues={initialValues}
          className="my-auto flex items-center gap-2"
        >
          <Form.Item
            name="estimation"
            // initialValue={2}
            // label="Estimation (in hours)"
            // style={{ width: "70px" }}
            className="m-0 flex w-[70px] items-center"
            rules={[
              { required: true, message: "Estimation is required" },
              {
                type: "number",
                min: 0,
                message: "Estimation must be at least 0",
              },
            ]}
          >
            <InputNumber
              type="number"
              placeholder="hours"
              className="my-auto w-[70px]"
            />
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
        <div className="flex justify-center gap-2">
          {task.estimation ? (
            <div className="text-center">
              <FormatTimeForSettings time={task.estimation} />
            </div>
          ) : (
            <div className="text-center">---</div>
          )}
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
