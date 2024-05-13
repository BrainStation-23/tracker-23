import {
  Checkbox,
  DatePicker,
  Divider,
  Form,
  Input,
  Select,
  SelectProps,
  Space,
  Spin,
  TimePicker,
} from "antd";
import dayjs from "dayjs";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import React, { useEffect, useRef, useState } from "react";
import { SizeType } from "antd/es/config-provider/SizeContext";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import SecondaryButton from "@/components/common/buttons/secondaryButton";
import MyInputCreateTask from "@/components/common/form/MyInputCreateTask";

import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

import { CreateTaskDto, CreateTaskValues } from "models/tasks";
import RecurrentTaskCreationComponent from "./recurrentTaskCreationComponent";
import AddLocalProject from "@/components/integrations/projectImport/addLocalProject";

const size: SizeType = "middle";
const options: SelectProps["options"] = [];

const CreateTaskComponent = ({ createTask }: any) => {
  const [form] = Form.useForm();
  const elementRef = useRef(null);

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

  const initialValues = {
    projectId: projectData[0]?.value,
  };

  const [startDate, setStartDate] = useState(dayjs());
  const [selectedProject, setSelectedProject] = useState<number>(
    projectData[0]?.value
  );
  const [priorityNames, setPriorityNames] = useState(
    priorities
      .filter((p) => p.projectId === selectedProject)
      .map((pp) => pp.name)
  );

  const [CreatingTask, setCreatingTask] = useState<boolean>(false);
  const [recurrentTask, setRecurrentTask] = useState<boolean>(false);

  const onFinish = async (values: CreateTaskValues) => {
    setCreatingTask(true);
    const formattedValues: CreateTaskDto = getFormattedValues(values);
    await createTask(formattedValues);
    setCreatingTask(false);
    form.resetFields();
  };

  const handleFrequencyChange = (value: string) => {
    console.log(`Selected: ${value}`);
  };
  const handleTagsChange = (value: string[]) => {
    console.log(`Selected: ${value}`);
  };

  const onCheckBoxChange = (e: CheckboxChangeEvent) => {
    setRecurrentTask(e.target.checked);
  };

  const resetAll = () => {
    form.resetFields();
    setRecurrentTask(false);
  };

  useEffect(() => {
    setPriorityNames(
      priorities
        .filter((p) => p.projectId == selectedProject)
        .map((pp) => pp.name)
    );
  }, [priorities, selectedProject]);

  return (
    <Spin spinning={CreatingTask} tip={"Processing"}>
      <Form
        form={form}
        onFinish={onFinish}
        name="control-hooks"
        requiredMark={false}
        initialValues={initialValues}
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
            type="TextArea"
            name="description"
            label="Description"
            placeholder="Enter text here..."
          />

          <div className="grid w-full grid-cols-2 gap-3">
            <MyInputCreateTask
              name="estimation"
              label="Estimation (in hours)"
              rules={[{ required: true, message: "Estimation is Required" }]}
            >
              <Input type="number" placeholder="hours" />
            </MyInputCreateTask>
            <MyInputCreateTask
              label="Project"
              name="projectId"
              rules={[{ required: true, message: "Project is Required" }]}
            >
              <Select
                placeholder="Select Project"
                onChange={(e) => setSelectedProject(e)}
                dropdownRender={(menu) => (
                  <>
                    <div className="max-h-24 overflow-auto">{menu}</div>
                    <Divider style={{ margin: "8px 0" }} />
                    <Space style={{ padding: "0 8px 4px" }}>
                      <AddLocalProject
                        type={2}
                        setIsModalOpen={() => {}}
                        setSpinning={setCreatingTask}
                        closeDropdowns={() => form.resetFields(["projectName"])}
                      />
                    </Space>
                  </>
                )}
                options={projectData}
              />
            </MyInputCreateTask>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MyInputCreateTask
              name="priority"
              label="Priority"
              rules={[{ required: true, message: "Priority is Required" }]}
            >
              <Select
                onChange={handleFrequencyChange}
                placeholder="Select Priority"
                options={priorityNames?.map((priorityName) => ({
                  value: priorityName,
                  label: priorityName,
                }))}
              />
            </MyInputCreateTask>
            <MyInputCreateTask name="label" label="Label" initialValue={[]}>
              <Select
                mode="tags"
                size={size}
                options={options}
                style={{ width: "100%" }}
                placeholder="Please select"
                onChange={handleTagsChange}
              />
            </MyInputCreateTask>
          </div>
          <div className="grid grid-cols-2">
            <MyInputCreateTask
              label="Date"
              name={"startDate"}
              initialValue={dayjs()}
              rules={[{ required: true }]}
            >
              <DatePicker onChange={(e) => setStartDate(e)} className="m-0" />
            </MyInputCreateTask>

            <MyInputCreateTask name="timeRange" label="Time Range">
              <TimePicker.RangePicker use12Hours format="h:mm a" />
            </MyInputCreateTask>
          </div>

          <Form.Item
            className="mb-1"
            name="isRecurrent"
            valuePropName="checked"
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
            <SecondaryButton htmlType="button" onClick={resetAll}>
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
