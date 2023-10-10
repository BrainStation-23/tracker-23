import {
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
import dayjs from "dayjs";
import { CreateTaskDto, CreateTaskValues } from "models/tasks";
import React, { useRef, useState } from "react";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import SecondaryButton from "@/components/common/buttons/secondaryButton";
import MyInputCreateTask from "@/components/common/form/MyInputCreateTask";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

import RecurrentTaskCreationComponent from "./recurrentTaskCreationComponent";

const { RangePicker } = DatePicker;

const CreateTaskComponent = ({ taskList, createTask }: any) => {
  const { TextArea } = Input;
  const elementRef = useRef(null);

  const scrollToBottom = () => {
    elementRef.current.scrollTop = elementRef.current.scrollHeight;
  };

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
    const scrollTimeout = setTimeout(() => {
      scrollToBottom();
    }, 50);
    // scrollToBottom();
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
        requiredMark={false}
        className="custom-create-task-css"
      >
        <div ref={elementRef} className="mb-2 max-h-[650px] overflow-auto">
          {/* <Form.Item
            name="title"
            label="Task Name"
            rules={[{ required: true }]}
            labelCol={{ span: 24 }}
          >
            <Input placeholder="Enter your task name" />
          </Form.Item> */}
          <MyInputCreateTask
            name="title"
            label="Task Name"
            placeholder="Enter your task name"
            rules={[{ required: true }]}
          />
          <MyInputCreateTask
            name="description"
            label="Description"
            placeholder="Enter text here..."
            type="TextArea"
          />
          {/* <Form.Item
            name="description"
            label="Description"
            // initialValue={"sample description"}
            labelCol={{ span: 24 }}
            // rules={[{ required: true }]}
          >
            <TextArea placeholder="Enter text here..." />
          </Form.Item> */}
          <div className="grid w-full grid-cols-2 gap-3">
            {/* <Form.Item
              name="estimation"
              // initialValue={2}
              label="Estimation (in hours)"
              labelCol={{ span: 24 }}
              rules={[{ required: true }]}
              className="mb-1"
            >
              <Input type="number" placeholder="hours" />
            </Form.Item> */}
            <MyInputCreateTask
              name="estimation"
              // initialValue={2}
              label="Estimation (in hours)"
              rules={[{ required: true }]}
            >
              <Input type="number" placeholder="hours" />
            </MyInputCreateTask>
            <MyInputCreateTask
              name="priority"
              label="Priority"
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
            </MyInputCreateTask>
            {/* <Form.Item
              name="priority"
              label="Priority"
              labelCol={{ span: 24 }}
              rules={[{ required: true }]}
              className="mb-1"
            >
              <Select
                onChange={handleFrequencyChange}
                options={[
                  { value: "LOW", label: "LOW" },
                  { value: "MEDIUM", label: "MEDIUM" },
                  { value: "HIGH", label: "HIGH" },
                ]}
              />
            </Form.Item> */}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MyInputCreateTask
              name="projectId"
              label="Project"
              rules={[{ required: true }]}
            >
              <Select onChange={handleProjectIdChange} options={projectData} />
            </MyInputCreateTask>
            {/* <Form.Item
              name="projectId"
              label="Project"
              labelCol={{ span: 24 }}
              rules={[{ required: true }]}
              className="mb-1"
            >
              <Select onChange={handleProjectIdChange} options={projectData} />
            </Form.Item>
            {(!projectData || projectData.length === 0) && (
              <Link href={"/projects"} className="top-[-15px] text-red-500">
                No projects. Create project to add tasks
              </Link>
            )} */}
            <MyInputCreateTask name="label" label="Label" initialValue={[]}>
              <Select
                mode="tags"
                size={size}
                placeholder="Please select"
                // defaultValue={["Bug Fix"]}
                onChange={handleTagsChange}
                style={{ width: "100%" }}
                options={options}
              />
            </MyInputCreateTask>
            {/* <Form.Item
            name="label"
            label="Label"
            initialValue={[]}
            labelCol={{ span: 24 }}
            className="mb-1"
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
          </Form.Item> */}
          </div>
          <div className="grid grid-cols-2">
            <MyInputCreateTask
              name={"startDate"}
              label="Date"
              rules={[{ required: true }]}
              initialValue={dayjs()}
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
            </MyInputCreateTask>
            {/* <Form.Item
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
            </Form.Item> */}
            <MyInputCreateTask name="timeRange" label="Time Range">
              <TimePicker.RangePicker use12Hours format="h:mm a" />
            </MyInputCreateTask>
            {/* <Form.Item
              name="timeRange"
              label="Time Range"
              labelCol={{ span: 24 }}
              className="col-span-1 mb-1"
              // rules={[{ required: true }]}
            >
              <TimePicker.RangePicker use12Hours format="h:mm a" />
            </Form.Item> */}
          </div>

          <Form.Item
            name="isRecurrent"
            valuePropName="checked"
            className="mb-1"
          >
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
  const formattedValues = {
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
    startTime: values.timeRange ? values.timeRange[0] : null,
    endTime: values.timeRange ? values.timeRange[1] : null,
  };
  if (values?.repeat) formattedValues.repeat = +values.repeat;
  if (values?.occurrences) formattedValues.occurrences = +values.occurrences;
  return formattedValues;
};
