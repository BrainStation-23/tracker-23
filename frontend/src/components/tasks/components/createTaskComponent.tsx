import {
  Button,
  Checkbox,
  DatePicker,
  Divider,
  Form,
  Input,
  InputRef,
  Select,
  SelectProps,
  Space,
  Spin,
  TimePicker,
} from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import { SizeType } from "antd/es/config-provider/SizeContext";
import dayjs from "dayjs";
import { CreateTaskDto, CreateTaskValues } from "models/tasks";
import React, { useEffect, useRef, useState } from "react";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import SecondaryButton from "@/components/common/buttons/secondaryButton";
import MyInputCreateTask from "@/components/common/form/MyInputCreateTask";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

import RecurrentTaskCreationComponent from "./recurrentTaskCreationComponent";
import { PlusOutlined } from "@ant-design/icons";
import AddLocalProject from "@/components/importSection/projectImport/components/addLocalProject";
import { message } from "antd";

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

  const priorities = useAppSelector(
    (state: RootState) => state.prioritySlice.priorities
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
  const [selectedProject, setSelectedProject] = useState<number>(
    projectData[0]?.value
  );
  const [priorityNames, setPriorityNames] = useState(
    priorities
      .filter((p) => p.projectId === selectedProject)
      .map((pp) => pp.name)
  );
  useEffect(() => {
    console.log(
      "XXXXXX",
      priorityNames,
      selectedProject,
      priorities,
      priorities.filter((p) => {
        console.log("XXXXX", p.projectId, selectedProject);

        return p.projectId == selectedProject;
      })
    );

    setPriorityNames(
      priorities
        .filter((p) => p.projectId == selectedProject)
        .map((pp) => pp.name)
    );
  }, [selectedProject]);
  const [name, setName] = useState("");
  const [projectItems, setProjectItems] = useState(["jack", "lucy"]);

  const inputRef = useRef<InputRef>(null);

  const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

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
    "🚀 ~ file: createTaskComponent.tsx:94 ~ CreateTaskComponent ~ initialValues:",
    initialValues,
    projectData
  );

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
    <Spin spinning={CreatingTask} tip={"Processing"}>
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
          <MyInputCreateTask
            name="title"
            label="Task Name"
            placeholder="Enter your task name"
            rules={[{ required: true, message: "Task Name is Required" }]}
          />
          <MyInputCreateTask
            name="description"
            label="Description"
            placeholder="Enter text here..."
            type="TextArea"
          />

          <div className="grid w-full grid-cols-2 gap-3">
            <MyInputCreateTask
              name="estimation"
              // initialValue={2}
              label="Estimation (in hours)"
              rules={[{ required: true, message: "Estimation is Required" }]}
            >
              <Input type="number" placeholder="hours" />
            </MyInputCreateTask>
            <MyInputCreateTask
              name="priority"
              label="Priority"
              rules={[{ required: true, message: "Priority is Required" }]}
            >
              <Select
                onChange={handleFrequencyChange}
                options={priorityNames?.map((priorityName) => {
                  return { value: priorityName, label: priorityName };
                })}
              />
            </MyInputCreateTask>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MyInputCreateTask
              name="projectId"
              label="Project"
              rules={[{ required: true, message: "Project is Required" }]}
            >
              {/* <Select onChange={handleProjectIdChange} options={projectData} /> */}
              <Select
                placeholder="Select Project"
                onChange={(e) => {
                  setSelectedProject(e);
                }}
                dropdownRender={(menu) => (
                  <>
                    <div className="max-h-24 overflow-auto">{menu}</div>
                    <Divider style={{ margin: "8px 0" }} />
                    <Space style={{ padding: "0 8px 4px" }}>
                      <AddLocalProject
                        setSpinning={setCreatingTask}
                        setIsModalOpen={() => {}}
                        closeDropdowns={() => {
                          form.resetFields(["projectName"]);
                          console.log(
                            "🚀 ~ file: createTaskComponent.tsx:184 ~ CreateTaskComponent ~ projectName:",
                            "projectName"
                          );
                        }}
                        type={2}
                      />
                    </Space>
                  </>
                )}
                options={projectData}
              />
            </MyInputCreateTask>
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

            <MyInputCreateTask name="timeRange" label="Time Range">
              <TimePicker.RangePicker use12Hours format="h:mm a" />
            </MyInputCreateTask>
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
