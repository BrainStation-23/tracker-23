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
import { CreateTaskValues } from "models/tasks";
import React, { useState } from "react";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import SecondaryButton from "@/components/common/buttons/secondaryButton";
import { localFormat, timeFormat } from "@/components/datePicker";
import { QuestionCircleOutlined } from "@ant-design/icons";
import RecurrentTaskCreationComponent from "./recurrentTaskCreationComponent";
import Link from "next/link";

const { RangePicker } = DatePicker;

const CreateTaskComponent = ({ taskList, createTask }: any) => {
  const [customDateValue, setCustomDateValue] = useState<any>([
    dayjs(),
    dayjs(),
  ]);
  const dateFormat = "DD/MM/YYYY";
  const [form] = Form.useForm();
  const onFinish = async (values: CreateTaskValues) => {
    console.log(
      "🚀 ~ file: createTaskComponent.tsx:35 ~ onFinish ~ values:",
      values
    );
    // setCreatingTask(true);
    // const formattedValues: CreateTaskDto = getFormattedValues(values);
    // const res = await createTask(formattedValues);

    // setCreatingTask(false);
  };

  const demoData = [
    {
      id: 59,
      projectId: 10241,
      projectName: "HT-Test2",
      projectKey: "HT2",
      source: "https://pm23.atlassian.net/browse/HT2",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 60,
      projectId: 10179,
      projectName: "MSFA-General Pharma",
      projectKey: "MSFA",
      source: "https://pm23.atlassian.net/browse/MSFA",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 61,
      projectId: 10245,
      projectName: "LMS Marketing",
      projectKey: "LM",
      source: "https://pm23.atlassian.net/browse/LM",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 62,
      projectId: 10247,
      projectName: "Shwapno E-Commerce Solution",
      projectKey: "SECS",
      source: "https://pm23.atlassian.net/browse/SECS",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 63,
      projectId: 10248,
      projectName: "PHP-Node-Cloud SBU Products",
      projectKey: "PROD",
      source: "https://pm23.atlassian.net/browse/PROD",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 64,
      projectId: 10185,
      projectName: "Cloud23 WAFR Automation",
      projectKey: "CWA",
      source: "https://pm23.atlassian.net/browse/CWA",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 65,
      projectId: 10250,
      projectName: "BioNippy",
      projectKey: "BION",
      source: "https://pm23.atlassian.net/browse/BION",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 66,
      projectId: 10251,
      projectName: "DNA Growth",
      projectKey: "DNA",
      source: "https://pm23.atlassian.net/browse/DNA",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 67,
      projectId: 10256,
      projectName: "NISSAN Driver's Guide App",
      projectKey: "NDGA",
      source: "https://pm23.atlassian.net/browse/NDGA",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 69,
      projectId: 10199,
      projectName: "Unity Assets Store",
      projectKey: "UAS",
      source: "https://pm23.atlassian.net/browse/UAS",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 70,
      projectId: 10204,
      projectName: "Robi QR Scanner POSM",
      projectKey: "RQSP",
      source: "https://pm23.atlassian.net/browse/RQSP",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 71,
      projectId: 10140,
      projectName: "Silent Scream: Blindmother",
      projectKey: "SSB",
      source: "https://pm23.atlassian.net/browse/SSB",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 72,
      projectId: 10145,
      projectName: "Dotphase Projects",
      projectKey: "DP",
      source: "https://pm23.atlassian.net/browse/DP",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 73,
      projectId: 10210,
      projectName: "MediLynq",
      projectKey: "MED",
      source: "https://pm23.atlassian.net/browse/MED",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 74,
      projectId: 10211,
      projectName: "GDS",
      projectKey: "GDS",
      source: "https://pm23.atlassian.net/browse/GDS",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 75,
      projectId: 10212,
      projectName: "Data Growers",
      projectKey: "DG",
      source: "https://pm23.atlassian.net/browse/DG",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 76,
      projectId: 10215,
      projectName: "Chatbot",
      projectKey: "CHAT",
      source: "https://pm23.atlassian.net/browse/CHAT",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 77,
      projectId: 10088,
      projectName: "BS Website",
      projectKey: "BSWEBSITE",
      source: "https://pm23.atlassian.net/browse/BSWEBSITE",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 78,
      projectId: 10218,
      projectName: "Kanban project for test",
      projectKey: "KPFT",
      source: "https://pm23.atlassian.net/browse/KPFT",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 79,
      projectId: 10219,
      projectName: "Mana Bay-Apps",
      projectKey: "MANA",
      source: "https://pm23.atlassian.net/browse/MANA",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 80,
      projectId: 10226,
      projectName: "AI Project",
      projectKey: "AP",
      source: "https://pm23.atlassian.net/browse/AP",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 81,
      projectId: 10098,
      projectName: "BS-Commerce",
      projectKey: "BC",
      source: "https://pm23.atlassian.net/browse/BC",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 82,
      projectId: 10229,
      projectName: "Maruboshi OM",
      projectKey: "MOM",
      source: "https://pm23.atlassian.net/browse/MOM",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 83,
      projectId: 10238,
      projectName: "TestTeamsConnectWithJira",
      projectKey: "TES",
      source: "https://pm23.atlassian.net/browse/TES",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 84,
      projectId: 10239,
      projectName: "SBU-USA BA Team",
      projectKey: "SUBT",
      source: "https://pm23.atlassian.net/browse/SUBT",
      integrated: false,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 85,
      projectId: 10000,
      projectName: "Overseer",
      projectKey: "OV",
      source: "https://overseer-himel.atlassian.net/browse/OV",
      integrated: false,
      integrationId: 6,
      workspaceId: 2,
    },
    {
      id: 86,
      projectId: 10002,
      projectName: "Tracker 23 Bug",
      projectKey: "T2B",
      source: "https://overseer-himel.atlassian.net/browse/T2B",
      integrated: false,
      integrationId: 6,
      workspaceId: 2,
    },
    {
      id: 87,
      projectId: 10003,
      projectName: "tracker23 Team",
      projectKey: "TT",
      source: "https://overseer-himel.atlassian.net/browse/TT",
      integrated: false,
      integrationId: 6,
      workspaceId: 2,
    },
    {
      id: 68,
      projectId: 10198,
      projectName: "Tracker 23",
      projectKey: "T23",
      source: "https://pm23.atlassian.net/browse/T23",
      integrated: true,
      integrationId: 5,
      workspaceId: 2,
    },
    {
      id: 115,
      projectId: null,
      projectName: "test",
      projectKey: null,
      source: "T23",
      integrated: true,
      integrationId: null,
      workspaceId: 2,
    },
    {
      id: 117,
      projectId: null,
      projectName: "test2",
      projectKey: null,
      source: "T23",
      integrated: false,
      integrationId: null,
      workspaceId: 2,
    },
    {
      id: 122,
      projectId: null,
      projectName: "testdsd",
      projectKey: null,
      source: "T23",
      integrated: false,
      integrationId: null,
      workspaceId: 2,
    },
    {
      id: 123,
      projectId: null,
      projectName: "dipu",
      projectKey: null,
      source: "T23",
      integrated: true,
      integrationId: null,
      workspaceId: 2,
    },
  ];

  const projectData = demoData
    ? demoData.map((data: any) => {
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
  console.log(
    "🚀 ~ file: createTaskComponent.tsx:404 ~ CreateTaskComponent ~ initialValues.projectData:",
    initialValues,
    projectData[0]?.value
  );
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
            {/* <Input /> */}
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
              defaultValue={dayjs()}
              // onChange={(e) => handelDateChange(e)}
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
            rules={[{ required: true }]}
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

        <Form.Item name="isRecurrent" valuePropName="checked">
          <Checkbox onChange={onCheckBoxChange}>Recurrent Task</Checkbox>
        </Form.Item>
        {recurrentTask && (
          <RecurrentTaskCreationComponent />
          // <div className="grid w-full grid-cols-12 gap-3">
          //     <Form.Item
          //         name="frequency"
          //         label="Frequency"
          //         labelCol={{ span: 24 }}
          //         rules={[{ required: true }]}
          //         className="col-span-3"
          //     >
          //         {/* <Input /> */}
          //         <Select
          //             placeholder="Select Frequency"
          //             onChange={handleFrequencyChange}
          //             options={[
          //                 {
          //                     value: "DAILY",
          //                     label: (
          //                         <div className="flex justify-between">
          //                             Daily
          //                             <Tooltip title="Repeat Every Day">
          //                                 <QuestionCircleOutlined />
          //                             </Tooltip>
          //                         </div>
          //                     ),
          //                 },
          //                 {
          //                     value: "WEEKLY",
          //                     label: (
          //                         <div className="flex justify-between">
          //                             Weekly
          //                             <Tooltip title="Repeat Every 7th Day">
          //                                 <QuestionCircleOutlined />
          //                             </Tooltip>
          //                         </div>
          //                     ),
          //                 },
          //                 {
          //                     value: "BI-WEEKLY",
          //                     label: (
          //                         <div className="flex justify-between">
          //                             Bi-Weekly
          //                             <Tooltip title="Repeat Every 14th Day">
          //                                 <QuestionCircleOutlined />
          //                             </Tooltip>
          //                         </div>
          //                     ),
          //                 },
          //             ]}
          //         />
          //     </Form.Item>
          //     <Form.Item
          //         name="timeRange"
          //         label="Time Range"
          //         labelCol={{ span: 24 }}
          //         className="col-span-4"
          //         rules={[{ required: true }]}
          //     >
          //         <TimePicker.RangePicker format={"HH:mm"} />
          //     </Form.Item>
          //     <Form.Item
          //         name="dateRange"
          //         label="Date Range"
          //         labelCol={{ span: 24 }}
          //         rules={[{ required: true }]}
          //         className="col-span-5"
          //     >
          //         <RangePicker
          //             value={customDateValue}
          //             format={dateFormat}
          //             clearIcon={false}
          //             bordered={true}
          //             inputReadOnly={true}
          //             autoFocus={true}
          //             className="w-[250px]"
          //             popupClassName=""
          //             placement="topRight"
          //             disabledDate={(current: Dayjs) => {
          //                 return (
          //                     current.valueOf() <
          //                     dayjs().subtract(1, "day").valueOf()
          //                 );
          //             }}
          //             onChange={(values) => {
          //                 setCustomDateValue(values);
          //             }}
          //         />
          //     </Form.Item>
          // </div>
        )}

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
