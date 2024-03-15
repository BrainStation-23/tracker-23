import { Form, Input, MenuProps, message } from "antd";
import { userAPI } from "APIs";
import classNames from "classnames";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { UpdateReportDto } from "models/reports";

import { ReportIcons } from "../reportPage";
import SecondaryButton from "@/components/common/buttons/secondaryButton";
import MoreButtonTopPanel from "@/components/common/topPanels/components/moreButtonTopPanel";
import {
  ReportData,
  updateReportSlice,
  deleteReportSlice,
  setReportInEditSlice,
} from "@/storage/redux/reportsSlice";

type Props = {
  title?: string;
  className?: string;
  exportButton?: React.ReactNode;
  extraFilterComponent?: React.ReactNode;
  reportData: ReportData;
  setIsLoading: Function;
};

export default function ReportHeaderComponent({
  title,
  className,
  exportButton,
  reportData,
  setIsLoading,
  extraFilterComponent,
}: Props) {
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  const [editing, setEditing] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const filterOptions = [
    <SecondaryButton key={1} onClick={deleteReport}>
      Delete
    </SecondaryButton>,
    <SecondaryButton key={2} className="w-full" onClick={handleEdit}>
      Edit
    </SecondaryButton>,
  ];
  const items: MenuProps["items"] = filterOptions.map((option, index) => ({
    label: option,
    key: index,
  }));
  const menuProps = {
    items,
    onClick: () => {
      setDropdownOpen(false);
    },
  };

  const updateTitle = async (data: UpdateReportDto) => {
    if (!reportData?.id) return;
    const res = await userAPI.updateReport(reportData.id, data);
    if (res) {
      dispatch(updateReportSlice(res));
    }
  };
  async function deleteReport() {
    setIsLoading(true);
    if (!reportData?.id) return;
    const res = await userAPI.deleteReport(reportData.id);
    if (res) {
      dispatch(deleteReportSlice(reportData));
      message.success("Report deleted successfully");
    }
    setIsLoading(false);
  }
  function handleEdit() {
    dispatch(setReportInEditSlice(reportData));
  }
  const onFinish = (values: { name: string }) => {
    const trimmedValue = values?.name?.trim();
    if (trimmedValue && trimmedValue !== title) {
      updateTitle({
        name: trimmedValue,
      });
    }
    setEditing(false);
  };

  const handleBlur = (value: string) => {
    const trimmedValue = value?.trim();
    if (trimmedValue && trimmedValue !== title) {
      updateTitle({ name: trimmedValue });
    }
    setEditing(false);
  };
  return (
    <div className={classNames("flex w-full flex-col gap-4 pb-3", className)}>
      <div className="flex items-center justify-between gap-3 ">
        <div onClick={() => setEditing(true)}>
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
                  {
                    pattern: /\S.*|\s+/,
                    message: "Please enter valid name",
                  },
                ]}
              >
                <Input
                  placeholder="Type something and press Enter"
                  className={classNames(
                    "m-0 p-0 px-1 text-base focus:shadow-none",
                    {
                      ["border-none"]: !editing,
                    }
                  )}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      form.submit();
                    }
                    if (e.key === "Escape") {
                      setEditing(false);
                    }
                  }}
                  onBlur={(e) => handleBlur(e.target.value)}
                />
              </Form.Item>
            </div>
          </Form>
        </div>
        <div className="flex items-center gap-2">
          {extraFilterComponent}
          {exportButton}
          <MoreButtonTopPanel
            {...{ menuProps, dropdownOpen, setDropdownOpen }}
          />
        </div>
      </div>
    </div>
  );
}
