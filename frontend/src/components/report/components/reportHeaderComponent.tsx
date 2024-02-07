import { Form, Input, message } from "antd";
import { userAPI } from "APIs";
import classNames from "classnames";
import { UpdateReportDto } from "models/reports";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import {
  deleteReportSlice,
  ReportData,
  setReportInEditSlice,
  updateReportSlice,
} from "@/storage/redux/reportsSlice";

import { ReportIcons } from "../reportPage";

import type { PropsWithChildren } from "react";
export default function ReportHeaderComponent({
  title,
  className,
  exportButton,
  reportData,
  setIsLoading,
}: PropsWithChildren<{
  title?: string;
  className?: string;
  exportButton?: React.ReactNode;
  reportData: ReportData;
  setIsLoading: Function;
}>) {
  const [editing, setEditing] = useState(false);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const updateTitle = async (data: UpdateReportDto) => {
    if (!reportData?.id) return;
    const res = await userAPI.updateReport(reportData.id, data);
    if (res) {
      console.log("🚀 ~ updateTitle ~ res:", res);
      dispatch(updateReportSlice(res));
    }
  };
  const deleteReprot = async () => {
    setIsLoading(true);
    if (!reportData?.id) return;
    const res = await userAPI.deleteReport(reportData.id);
    if (res) {
      dispatch(deleteReportSlice(reportData));
      message.success("Report deleted successfully");
    }
    setIsLoading(false);
  };
  const handleEdit = () => {
    dispatch(setReportInEditSlice(reportData));
  };
  const onFinish = (values: { name: string }) => {
    if (values.name !== title) {
      updateTitle(values);
    }
    setEditing(false);
  };
  return (
    <div className={classNames("flex w-full flex-col gap-4", className)}>
      <div className="flex items-center justify-between gap-3 ">
        <div onClick={() => setEditing(true)}>
          {!editing ? (
            <div className="flex items-center gap-2 text-lg font-semibold">
              <div className="flex items-center text-sm">
                {ReportIcons[reportData.reportType]}
              </div>
              <div>{title}</div>
            </div>
          ) : (
            <Form
              name="titleEdit"
              onFinish={onFinish}
              initialValues={{ name: title }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  form.submit();
                }
                if (e.key === "Escape") {
                  setEditing(false);
                }
              }}
            >
              <div className="flex items-center gap-2 text-lg font-semibold">
                {ReportIcons[reportData.reportType]}
                <Form.Item
                  name="name"
                  className="m-0"
                  rules={[
                    { required: true, message: "Please input something!" },
                  ]}
                >
                  <Input
                    placeholder="Type something and press Enter"
                    className="m-0 p-0 px-1 text-base focus:shadow-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        form.submit();
                      }
                      if (e.key === "Escape") {
                        setEditing(false);
                      }
                    }}
                  />
                </Form.Item>
              </div>
            </Form>
          )}
        </div>
        <div className="flex items-center gap-2">
          {exportButton}
          <PrimaryButton onClick={() => deleteReprot()}>Delete</PrimaryButton>
          <PrimaryButton onClick={() => handleEdit()}>Edit</PrimaryButton>
        </div>
      </div>
    </div>
  );
}
