import { Form, Input, Radio, Spin } from "antd";
import {
  CreateReportDto,
  ReportTypesDto,
  ReportTypesEnum,
} from "models/reports";
import React, { useState } from "react";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import { useRouter } from "next/router";
import { userAPI } from "APIs";
import { useDispatch } from "react-redux";
import { addReport } from "@/storage/redux/reportsSlice";

const options: ReportTypesDto[] = [
  "TIME_SHEET",
  "SPRINT_ESTIMATION",
  "TASK_LIST",
  "SPRINT_REPORT",
  "SPRINT_TIMELINE",
];

const AddNewReport = ({ setIsModalOpen }: { setIsModalOpen: Function }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const pageId = router.query?.reportPageId
    ? parseInt(router.query?.reportPageId as string)
    : -1;

  const [isLoading, setIsLoading] = useState(false);

  const createReport = async (data: CreateReportDto) => {
    setIsLoading(true);
    const res = await userAPI.createReport(data);
    if (res) {
      console.log("🚀 ~ createReport ~ res:", res);
      dispatch(addReport(res));
      setIsModalOpen(false);
    }
    setIsLoading(false);
  };

  const onFinish = (values: any) => {
    console.log({ ...values, pageId });
    createReport({ ...values, pageId });

    // You can perform further actions here, such as submitting the form data.
  };

  return (
    <Spin spinning={isLoading}>
      {" "}
      <Form
        onFinish={onFinish}
        layout="vertical"
        initialValues={{ reportType: options[0] }}
      >
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          name="reportType"
          label="Select a template"
          rules={[{ required: true }]}
        >
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
    </Spin>
  );
};

export default AddNewReport;
