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
  Tooltip,
} from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { SizeType } from "antd/es/config-provider/SizeContext";
import dayjs from "dayjs";
import { CreateTaskDto, CreateTaskValues } from "models/tasks";
import React, { useState } from "react";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import SecondaryButton from "@/components/common/buttons/secondaryButton";
import { localFormat, timeFormat } from "@/components/datePicker";
import { QuestionCircleOutlined } from "@ant-design/icons";
import RecurrentTaskCreationComponent from "./recurrentTaskCreationComponent";
import Link from "next/link";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

const { RangePicker } = DatePicker;

const CreateTaskComponent = ({ taskList, createTask }: any) => {
  const [startDate, setStartDate] = useState(dayjs());
  const [form] = Form.useForm();
  const onFinish = async (values: CreateTaskValues) => {
    setCreatingTask(true);
    const formattedValues: CreateTaskDto = getFormattedValues(values);
    const res = await createTask(formattedValues);

    setCreatingTask(false);
  };

  const allProjects = useAppSelector(
    (state: RootState) => state.projectList.projects
  );

  const localProjects = allProjects
    ? allProjects.filter((project) => project.source === "T23")
    : [];

  const projectData = localProjects
    ? localProjects.map((data: any) => {
        return {
          value: data.id.toString(),
          label: data.projectName,
        };
      })
    : [];
  const onReset = () => {
    form.resetFields();
  };
  const [size, setSize] = useState<SizeType>("middle");
  const [recurrentTask, setRecurrentTask] = useState<boolean>(false);
  const [CreatingTask, setCreatingTask] = useState<boolean>(false);

  const handleFrequencyChange = (value: string) => {
    console.log(`Selected: ${value}`);
  };
  const handleTagsChange = (value: string[]) => {
    console.log(`Selected: ${value}`);
  };
  const options: SelectProps["options"] = [];
  const initialValues = {
    priority: "MEDIUM",
    projectId: projectData[0]?.value,
  };

  const onCheckBoxChange = (e: CheckboxChangeEvent) => {
    setRecurrentTask(e.target.checked);
  };

  const handleProjectIdChange = (value: any) => {
    console.log(
      "🚀 ~ file: createTaskComponent.tsx:408 ~ handleProjectIdChange ~ value:",
      value
    );
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
        <div className="mb-2 max-h-[650px] overflow-auto">
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
              <Select
                onChange={handleFrequencyChange}
                options={[
                  { value: "LOW", label: "LOW" },
                  { value: "MEDIUM", label: "MEDIUM" },
                  { value: "HIGH", label: "HIGH" },
                ]}
              />
            </Form.Item>
          </div>
          <div className="mb-5">
            <Form.Item
              name="projectId"
              label="Project"
              labelCol={{ span: 24 }}
              rules={[{ required: true }]}
              className="m-0"
            >
              <Select onChange={handleProjectIdChange} options={projectData} />
            </Form.Item>
            {(!projectData || projectData.length === 0) && (
              <Link href={"/projects"} className="top-[-15px] text-red-500">
                No projects. Create project to add tasks
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2">
            <Form.Item
              name={"startDate"}
              label="Date"
              initialValue={dayjs()}
              rules={[{ required: true }]}
              labelCol={{ span: 24 }}
              className="col-span-1 m-0"
            >
              <DatePicker
                // defaultValue={dayjs()}
                onChange={(e) => {
                  setStartDate(e);
                }}
                className="m-0"
                // value={dateValue}
                // disabled={radioButtonValue !== 1}
              />
            </Form.Item>
            <Form.Item
              name="timeRange"
              label="Time Range"
              labelCol={{ span: 24 }}
              className="col-span-1"
              // rules={[{ required: true }]}
            >
              <TimePicker.RangePicker use12Hours format="h:mm a" />
            </Form.Item>
          </div>

          <Form.Item
            name="label"
            label="Label"
            initialValue={[]}
            labelCol={{ span: 24 }}
          >
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

          <Form.Item name="isRecurrent" valuePropName="checked">
            <Checkbox onChange={onCheckBoxChange}>Recurrent Task</Checkbox>
          </Form.Item>
          {recurrentTask && (
            <RecurrentTaskCreationComponent startDate={startDate} />
          )}
        </div>
        <Form.Item>
          <div className="flex flex-row-reverse gap-3">
            <PrimaryButton htmlType="submit">Submit</PrimaryButton>
            <SecondaryButton htmlType="button" onClick={onReset}>
              Reset
            </SecondaryButton>
          </div>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default CreateTaskComponent;

const getFormattedValues = (values: CreateTaskValues) => {
  console.log(
    "🚀 ~ file: createTaskComponent.tsx:661 ~ getFormattedValues ~ values:",
    values
  );
  return {
    ...values,
    estimation:
      typeof values.estimation !== "number"
        ? +values.estimation
        : values.estimation,
    projectId:
      typeof values.projectId !== "number"
        ? +values.projectId
        : values.projectId,
    label: values.label ? values.label : [],
  };
};
