import { Form, Radio } from "antd";
import { ReportTypesDto, ReportTypesEnum } from "models/reports";
import React from "react";

import PrimaryButton from "@/components/common/buttons/primaryButton";

const options: ReportTypesDto[] = [
  "TIME_SHEET",
  "SPRINT_ESTIMATION",
  "TASK_LIST",
  "SPRINT_REPORT",
];

const AddNewReport = () => {
  const onFinish = (values: any) => {
    console.log("Selected Option:", values.radioGroup);
    // You can perform further actions here, such as submitting the form data.
  };

  return (
    <Form
      onFinish={onFinish}
      layout="vertical"
      initialValues={{ radioGroup: options[0] }}
    >
      <Form.Item name="radioGroup" label="Select a template">
        <Radio.Group>
          {options.map((option: ReportTypesDto) => (
            <Radio key={option} value={option}>
              {ReportTypesEnum[option]}
            </Radio>
          ))}
        </Radio.Group>
      </Form.Item>

      <Form.Item>
        <PrimaryButton className="mx-auto" htmlType="submit">
          Create
        </PrimaryButton>
      </Form.Item>
    </Form>
  );
};

export default AddNewReport;
