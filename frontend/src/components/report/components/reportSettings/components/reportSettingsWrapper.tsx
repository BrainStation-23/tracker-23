import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import {
  ReportData,
  setReportInEditSlice,
  updateReportSlice,
} from "@/storage/redux/reportsSlice";
import { Form, Input, Typography, message } from "antd";
import classNames from "classnames";
import { UpdateReportDto } from "models/reports";
import { userAPI } from "APIs";
import { useState } from "react";
import { ReportIcons } from "@/components/report/reportPage";
const { Text } = Typography;

type Props = {
  children: React.ReactNode;
  reportData: ReportData;
  saveConfig: () => void;
};
const ReportSettingsWrapper = ({ reportData, children, saveConfig }: Props) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const handleCancel = () => {
    dispatch(setReportInEditSlice(null));
  };
  const [editing, setEditing] = useState(false);

  const updateTitle = async (data: UpdateReportDto) => {
    if (!reportData?.id) return;
    const res = await userAPI.updateReport(reportData.id, data);
    if (res) {
      dispatch(updateReportSlice(res));
    } else {
      message.warning("Report name update failed");
    }
  };

  const onFinish = (values: { name: string }) => {
    const trimmedValue = values?.name?.trim();
    if (trimmedValue && trimmedValue !== reportData.name) {
      updateTitle({
        name: trimmedValue,
      });
    }
    setEditing(false);
  };

  const handleBlur = (value: string) => {
    const trimmedValue = value?.trim();
    if (trimmedValue && trimmedValue !== reportData.name) {
      updateTitle({ name: trimmedValue });
    }
    setEditing(false);
  };

  return (
    <div className="flex h-full flex-col items-center justify-between gap-2 py-4 px-3">
      <div className="flex flex-col items-center justify-start gap-4 px-3">
        <div
          className="flex w-full flex-col gap-4"
          onClick={() => setEditing(true)}
        >
          <Form
            name="titleEdit"
            onFinish={onFinish}
            initialValues={{ name: reportData.name }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                form.submit();
              }
              if (e.key === "Escape") {
                setEditing(false);
              }
            }}
          >
            <div className="flex w-full items-center gap-2 text-lg font-semibold">
              <div>{ReportIcons[reportData.reportType]}</div>
              <Form.Item
                name="name"
                className="m-0 w-full"
                rules={[
                  { required: true, message: "Please input something!" },
                  {
                    pattern: /\S.*|\s+/,
                    message: "Please enter valid name",
                  },
                ]}
              >
                <Input
                  type="text"
                  placeholder="Type something and press Enter"
                  className={classNames(
                    "m-0 w-full p-0 px-1 text-base focus:shadow-none",
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
        <div className="flex flex-col gap-4 py-5">{children}</div>
      </div>
      <div className="flex w-full justify-center gap-6 border-t-2 pt-4">
        <PrimaryButton onClick={saveConfig}> Save</PrimaryButton>
        <PrimaryButton onClick={handleCancel}> Cancel</PrimaryButton>
      </div>
    </div>
  );
};

export default ReportSettingsWrapper;
