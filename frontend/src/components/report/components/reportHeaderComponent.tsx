import { Form, Input } from "antd";
import classNames from "classnames";
import React, { useState } from "react";
import type { PropsWithChildren } from "react";

export default function ReportHeaderComponent({
  title,
  children,
  className,
  innerClassName,
  exportButton,
}: PropsWithChildren<{
  title?: string;
  className?: string;
  innerClassName?: string;
  exportButton?: React.ReactNode;
}>) {
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  

  const onFinish = (values) => {
    console.log("Submitted:", values);
    if (values.title !== title) {
      console.log("<><><>");
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
              initialValues={{ title: title }}
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
                name="title"
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
