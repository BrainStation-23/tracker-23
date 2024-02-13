import { Form, Input, Radio, Spin } from "antd";
import { userAPI } from "APIs";
import {
  CreateReportDto,
  ReportTypes,
  ReportTypesDto,
  ReportTypesEnum,
} from "models/reports";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import { addReport } from "@/storage/redux/reportsSlice";

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
      dispatch(addReport(res));
      setIsModalOpen(false);
    }
    setIsLoading(false);
  };

  const onFinish = (values: any) => {
    createReport({ ...values, pageId });
  };

  return (
    <Spin spinning={isLoading}>
      <Form
        onFinish={onFinish}
        layout="vertical"
        initialValues={{ reportType: ReportTypes[0] }}
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
            {ReportTypes.map((option: ReportTypesDto) => (
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
