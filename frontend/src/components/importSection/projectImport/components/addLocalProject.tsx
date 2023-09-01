import { Button, Form, Input } from "antd";
import { userAPI } from "APIs";
import { CreateLocalProjectModel } from "models/apiParams";
import React from "react";
import { useEffect, useState } from "react";

type Props = {
  setSpinning: Function;
  setIsModalOpen: Function;
  closeDropdowns: Function;
};
const AddLocalProject = ({
  setSpinning,
  setIsModalOpen,
  closeDropdowns,
}: Props) => {
  const [projectName, setProjectName] = useState("");
  const handleSubmit = async (values: CreateLocalProjectModel) => {
    setSpinning(true);
    const res = await userAPI.createProject(values);
    console.log("Submitted values:", values);
    res && setIsModalOpen(false);
    setSpinning(false);
    res && closeDropdowns();
  };
  useEffect(() => {}, [projectName]);
  return (
    <Form onFinish={handleSubmit} className="flex items-center justify-between">
      <Form.Item
        label="Project Name"
        name="projectName"
        className="w-[60%]"
        rules={[
          {
            required: true,
            message: "Please enter a project name",
          },
        ]}
      >
        <Input
          placeholder="Enter project name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddLocalProject;
