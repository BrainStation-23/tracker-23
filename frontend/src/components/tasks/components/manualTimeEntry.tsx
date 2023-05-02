import { Button, DatePicker, Form, TimePicker } from "antd";
import { userAPI } from "APIs";
import { AddWorkLogParams, TaskDto } from "models/tasks";

import { localFormat } from "@/components/datePicker";

import { timeFormat } from "../../datePicker/index";

type Props = {
  task: TaskDto;
  handleAddManualSession: Function;
};
const ManualTimeEntry = ({ task, handleAddManualSession }: Props) => {
  console.log(
    "🚀 ~ file: manualTimeEntry.tsx:12 ~ ManualTimeEntry ~ task:",
    task
  );
  const [form] = Form.useForm();
  const initialValues = {};
  const onFinish = async (values: any) => {
    console.log(values);
    console.log(values.time);
    const tmp: AddWorkLogParams = {
      startTime: new Date(
        `${localFormat(values.date)} ${timeFormat(values.time[0])}`
      ),
      endTime: new Date(
        `${localFormat(values.date)} ${timeFormat(values.time[1])}`
      ),
      taskId: task.id,
    };
    const session = await userAPI.addManualWorkLog(tmp);
    if (session) {
      handleAddManualSession(task, session);
    }
    console.log(tmp);
  };

  const onReset = () => {
    form.resetFields();
  };
  return (
    <div>
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
          className="col-span-4"
          rules={[{ required: true }]}
        >
          <TimePicker.RangePicker format={"HH:mm"} />
        </Form.Item>
        <Form.Item
          name="date"
          label="Date"
          labelCol={{ span: 24 }}
          className="col-span-4"
          rules={[{ required: true }]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item>
          <div className="flex justify-center gap-3">
            <Button
              type="ghost"
              htmlType="submit"
              className="bg-[#00A3DE] text-white hover:bg-[#00a3deb2]"
            >
              Add Entry
            </Button>
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ManualTimeEntry;
