import { Form, Input, Radio, Spin } from "antd";
import { userAPI } from "APIs";
import {
  CreateReportDto,
  FilterDateType,
  ReportTypes,
  ReportTypesDto,
  ReportTypesEnum,
} from "models/reports";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import { addReport } from "@/storage/redux/reportsSlice";
import { getDateRangeArray } from "@/components/common/datePicker";

const AddNewReport = ({ setIsModalOpen }: { setIsModalOpen: Function }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const pageId = router.query?.reportPageId
    ? parseInt(router.query?.reportPageId as string)
    : -1;

  const [form] = Form.useForm();

  const [isLoading, setIsLoading] = useState(false);

  const createReport = async (data: CreateReportDto) => {
    setIsLoading(true);
    console.log(data, "data from addNewReport.tsx");
    if (data.reportType === "SCRUM_REPORT") {
      const dateRange = getDateRangeArray(FilterDateType.TODAY, true);
      data.config = { "endDate": dateRange[0],
        "startDate": dateRange[1],
        "filterDateType": FilterDateType.TODAY};
    }
    const res = await userAPI.createReport(data);
    if (res) {
      dispatch(addReport(res));
      setIsModalOpen(false);
    }
    setIsLoading(false);
  };

  const onFinish = async (values: any) => {
    await createReport({ ...values, pageId });
    form.resetFields();
  };

  return (
    <Spin spinning={isLoading}>
      <Form
        form={form}
        onFinish={onFinish}
        layout="vertical"
        initialValues={{ reportType: ReportTypes[0], name: "" }}
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
