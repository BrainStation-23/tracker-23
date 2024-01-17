import { ReportData, updateReportSlice } from "@/storage/redux/reportsSlice";
import { userAPI } from "APIs";
import { Form, Input } from "antd";
import classNames from "classnames";
import { UpdateReportDto } from "models/reports";
import React, { useState } from "react";
import type { PropsWithChildren } from "react";
import { useDispatch } from "react-redux";

export default function ReportHeaderComponent({
  title,
  children,
  className,
  innerClassName,
  exportButton,
  reportData,
}: PropsWithChildren<{
  title?: string;
  className?: string;
  innerClassName?: string;
  exportButton?: React.ReactNode;
  reportData: ReportData;
}>) {
  const [editing, setEditing] = useState(false);
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const updateTitle = async (data: UpdateReportDto) => {
    if (!reportData?.id) return;
    const res = await userAPI.updateReport(reportData.id, data);
    if (res) {
      console.log("🚀 ~ updateTitle ~ res:", res);
      // dispatch(updateReportSlice(res));
    }
  };

  const onFinish = (values: { name: string }) => {
    console.log("Submitted:", values);
    if (values.name !== title) {
      console.log("<><><>");
      updateTitle(values);
    }
    setEditing(false);
    // You can perform further actions here, such as submitting the form data.
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
                  // onPressEnter={() => {
                  //   document
                  //     .getElementsByName("inputField")[0]
                  //     .dispatchEvent(new Event("submit", { cancelable: true }));
                  // }}
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
        {exportButton}
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
