import { Form, Input } from "antd";
import { userAPI } from "APIs";
import { CreateLocalProjectModel } from "models/apiParams";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import PrimaryButton from "@/components/common/buttons/primaryButton";
import { addNewProjectSlice } from "@/storage/redux/projectsSlice";

type Props = {
  setSpinning: Function;
  setIsModalOpen: Function;
  closeDropdowns: Function;
  type?: number;
};
const AddLocalProject = ({
  setSpinning,
  setIsModalOpen,
  closeDropdowns,
  type,
}: Props) => {
  const formRef: any = useRef();
  const dispatch = useDispatch();
  const [projectName, setProjectName] = useState("");
  const handleSubmit = async (values: CreateLocalProjectModel) => {
    setSpinning(true);
    const res = await userAPI.createProject(values);
    console.log("Submitted values:", values);
    if (res) {
      setIsModalOpen(false);
      dispatch(addNewProjectSlice(res));
      closeDropdowns();
      formRef.current && formRef.current.resetFields();
    }
    setSpinning(false);
  };
  useEffect(() => {}, [projectName]);
  return (
    <Form
      ref={formRef}
      onFinish={handleSubmit}
      className="flex items-center justify-between gap-2"
    >
      <Form.Item
        label={type === 2 ? null : "Project Name"}
        name="projectName"
        className={type === 2 ? "" : "w-[60%]"}
        rules={[
          {
            required: true,
            message: type === 2 ? "Required" : "Please enter a project name",
          },
        ]}
      >
        <Input
          placeholder={type === 2 ? "Project Name" : "Enter project name"}
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
        />
      </Form.Item>

      <Form.Item>
        <PrimaryButton className="px-1" htmlType="submit">
          {type === 2 ? <PlusIconSvg /> : "Submit"}
        </PrimaryButton>
      </Form.Item>
    </Form>
  );
};

export default AddLocalProject;
