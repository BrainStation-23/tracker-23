import { Button, DatePicker, Form, Spin, TimePicker } from "antd";
import { userAPI } from "APIs";
import { AddWorkLogParams, TaskDto } from "models/tasks";
import { useState } from "react";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import { localFormat } from "@/components/common/datePicker";

import { timeFormat } from "../../common/datePicker/index";

type Props = {
  task: TaskDto;
  handleAddManualSession: Function;
};
const EditSessionComponent = ({ task, handleAddManualSession }: Props) => {
  const [spinning, setSpinning] = useState(false);
  const [form] = Form.useForm();
  const initialValues = {};
  const onFinish = async (values: any) => {
    const tmp: AddWorkLogParams = {
      startTime: new Date(
        `${localFormat(values.date)} ${timeFormat(values.time[0])}`
      ),
      endTime: new Date(
        `${localFormat(values.date)} ${timeFormat(values.time[1])}`
      ),
      taskId: task.id,
    };
    setSpinning(true);
    const session = await userAPI.addManualWorkLog(tmp);
    if (session) {
      handleAddManualSession(task, session);
    }
    setSpinning(false);
  };

  const onReset = () => {
    form.resetFields();
  };
  return (
    <Spin spinning={spinning}>
      <Form
        form={form}
        name="control-hooks"
        onFinish={onFinish}
        initialValues={initialValues}
        // style={{ width: "500px" }}
      >
        <Form.Item
          name="time"
          label="Time"
          labelCol={{ span: 24 }}
          rules={[{ required: true }]}
        >
          <TimePicker.RangePicker format={"HH:mm"} className="w-full" />
        </Form.Item>
        <Form.Item
          name="date"
          label="Date"
          labelCol={{ span: 24 }}
          className="col-span-4"
          rules={[{ required: true }]}
        >
          <DatePicker className="w-full" />
        </Form.Item>
        <Form.Item>
          <div className="flex justify-end gap-3">
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
            <PrimaryButton htmlType="submit">Add Entry</PrimaryButton>
          </div>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default EditSessionComponent;
