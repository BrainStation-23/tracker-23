import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Select,
  SelectProps,
  Spin,
  TimePicker,
} from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { SizeType } from "antd/es/config-provider/SizeContext";
import dayjs, { Dayjs } from "dayjs";
import { CreateTaskDto, CreateTaskValues } from "models/tasks";
import React, { useState } from "react";

import { localFormat, timeFormat } from "@/components/datePicker";

const { RangePicker } = DatePicker;

const CreateTaskComponent = ({ taskList, createTask }: any) => {
  const [customDateValue, setCustomDateValue] = useState<any>([
    dayjs(),
    dayjs(),
  ]);
  const dateFormat = "DD/MM/YYYY";
  const [form] = Form.useForm();
  const onFinish = async (values: CreateTaskValues) => {
    setCreatingTask(true);
    const formattedValues: CreateTaskDto = getFormattedValues(values);
    const res = await createTask(formattedValues);
    console.log(
      "🚀 ~ file: CreateTaskComponent copy.tsx:23 ~ onFinish ~ res",
      res
    );
    setCreatingTask(false);
  };

  const onReset = () => {
    form.resetFields();
  };
  const [size, setSize] = useState<SizeType>("middle");
  const [recurrentTask, setRecurrentTask] = useState<boolean>(false);
  const [CreatingTask, setCreatingTask] = useState<boolean>(false);

  const handlePriorityChange = (value: string) => {
    console.log(`Selected: ${value}`);
  };
  const handleTagsChange = (value: string[]) => {
    console.log(`Selected: ${value}`);
  };
  const options: SelectProps["options"] = [];
  const initialValues = {
    priority: "MEDIUM",
  };
  const onCheckBoxChange = (e: CheckboxChangeEvent) => {
    setRecurrentTask(e.target.checked);
  };
  return (
    <Spin spinning={CreatingTask} tip={"Adding Task"}>
      <Form
        form={form}
        name="control-hooks"
        onFinish={onFinish}
        initialValues={initialValues}
        // style={{ width: "500px" }}
      >
        <Form.Item
          name="title"
          label="Task Name"
          rules={[{ required: true }]}
          labelCol={{ span: 24 }}
        >
          <Input placeholder="Enter your task name" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          // initialValue={"sample description"}
          labelCol={{ span: 24 }}
          // rules={[{ required: true }]}
        >
          <Input placeholder="Enter text here..." />
        </Form.Item>
        <div className="grid w-full grid-cols-2 gap-3">
          <Form.Item
            name="estimation"
            // initialValue={2}
            label="Estimation (in hours)"
            labelCol={{ span: 24 }}
            rules={[{ required: true }]}
          >
            <Input type="number" placeholder="hours" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            labelCol={{ span: 24 }}
            rules={[{ required: true }]}
          >
            {/* <Input /> */}
            <Select
              onChange={handlePriorityChange}
              options={[
                { value: "LOW", label: "LOW" },
                { value: "MEDIUM", label: "MEDIUM" },
                { value: "HIGH", label: "HIGH" },
              ]}
            />
          </Form.Item>
        </div>

        <Form.Item
          name="label"
          label="Label"
          initialValue={[]}
          labelCol={{ span: 24 }}
        >
          {/* <Input /> */}

          <Select
            mode="tags"
            size={size}
            placeholder="Please select"
            // defaultValue={["Bug Fix"]}
            onChange={handleTagsChange}
            style={{ width: "100%" }}
            options={options}
          />
        </Form.Item>

        <Form.Item
          name="isRecurrent"
          label="isRecurrent"
          valuePropName="checked"
        >
          <Checkbox onChange={onCheckBoxChange}>Recurrent Task</Checkbox>
        </Form.Item>
        {recurrentTask && (
          <div className="grid w-full grid-cols-12 gap-3">
            <Form.Item
              name="frequency"
              label="Frequency"
              labelCol={{ span: 24 }}
              rules={[{ required: true }]}
              className="col-span-3"
            >
              {/* <Input /> */}
              <Select
                placeholder="Select Frequency"
                onChange={handlePriorityChange}
                options={[
                  { value: "DAILY", label: "Daily" },
                  { value: "WEEKLY", label: "Weekly" },
                  { value: "BI-WEEKLY", label: "Bi-Weekly" },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="timeRange"
              label="Time Range"
              labelCol={{ span: 24 }}
              className="col-span-4"
              rules={[{ required: true }]}
            >
              <TimePicker.RangePicker format={"HH:mm"} />
            </Form.Item>
            <Form.Item
              name="dateRange"
              label="Date Range"
              labelCol={{ span: 24 }}
              rules={[{ required: true }]}
              className="col-span-5"
            >
              <RangePicker
                value={customDateValue}
                format={dateFormat}
                clearIcon={false}
                bordered={true}
                inputReadOnly={true}
                autoFocus={true}
                className="w-[250px]"
                popupClassName=""
                placement="topRight"
                disabledDate={(current: Dayjs) => {
                  return (
                    current.valueOf() < dayjs().subtract(1, "day").valueOf()
                  );
                }}
                onChange={(values) => {
                  setCustomDateValue(values);
                }}
              />
            </Form.Item>
          </div>
        )}

        <Form.Item>
          <div className="flex flex-row-reverse gap-3">
            <Button
              type="ghost"
              htmlType="submit"
              className="bg-[#00A3DE] text-white hover:bg-[#00a3deb2]"
            >
              Submit
            </Button>
            <Button htmlType="button" onClick={onReset}>
              Reset
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default CreateTaskComponent;

const getFormattedValues = (values: CreateTaskValues) => {
  if (values.isRecurrent)
    return {
      title: values.title,
      estimation:
        typeof values.estimation !== "number"
          ? +values.estimation
          : values.estimation,
      priority: values.priority,
      label: values.label ? values.label : [],
      isRecurrent: values.isRecurrent ? true : false,
      frequency: values.frequency,
      startTime: new Date(
        `${localFormat(values.dateRange[0])} ${timeFormat(values.timeRange[0])}`
      ),
      endTime: new Date(
        `${localFormat(values.dateRange[0])} ${timeFormat(values.timeRange[1])}`
      ),
      startDate: localFormat(values.dateRange[0]),
      endDate: localFormat(values.dateRange[1]),
    };
  else
    return {
      title: values.title,
      estimation:
        typeof values.estimation !== "number"
          ? +values.estimation
          : values.estimation,
      priority: values.priority,
      label: values.label ? values.label : [],
      isRecurrent: values.isRecurrent ? true : false,
    };
};
