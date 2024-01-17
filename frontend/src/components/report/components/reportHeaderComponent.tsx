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
  updateReportSlice,
} from "@/storage/redux/reportsSlice";

import type { PropsWithChildren } from "react";
export default function ReportHeaderComponent({
  title,
  children,
  className,
  innerClassName,
  exportButton,
  reportData,
  setIsLoading,
  saveCofigButton,
}: PropsWithChildren<{
  title?: string;
  className?: string;
  innerClassName?: string;
  exportButton?: React.ReactNode;
  saveCofigButton?: React.ReactNode;
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

  const onFinish = (values: { name: string }) => {
    if (values.name !== title) {
      updateTitle(values);
    }
    setEditing(false);
  };
  return (
    <div className={classNames("my-5 flex w-full flex-col  gap-4", className)}>
      <div className="flex items-center justify-between gap-3 ">
        <div onClick={() => setEditing(true)}>
          {!editing ? (
            <div className="text-2xl font-semibold">{title}</div>
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
              <Form.Item
                name="name"
                rules={[{ required: true, message: "Please input something!" }]}
              >
                <Input
                  placeholder="Type something and press Enter"
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
            </Form>
          )}
        </div>
        <div className="flex items-center gap-2">
          {exportButton}
          {saveCofigButton}
          <PrimaryButton onClick={() => deleteReprot()}>Delete</PrimaryButton>
        </div>
      </div>
      <div className="flex h-auto w-full">
        <div
          className={classNames(
            "flex h-auto w-full flex-wrap items-center justify-end gap-6",
            innerClassName
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
