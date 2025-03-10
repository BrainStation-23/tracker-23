import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import { ReportData, setReportInEditSlice } from "@/storage/redux/reportsSlice";
import { Form, Input, Tooltip, Typography } from "antd";
import { UpdateReportDto } from "models/reports";
import { useEffect, useState } from "react";
import { ReportIcons } from "@/components/report/reportPage";
const { Text } = Typography;

type Props = {
  children: React.ReactNode;
  reportData: ReportData;
  saveConfig: (extraData?: UpdateReportDto) => Promise<void>;
};
const ReportSettingsWrapper = ({ reportData, children, saveConfig }: Props) => {
  const [form] = Form.useForm();
  const formFieldId = Form.useWatch("id", form);
  const dispatch = useDispatch();
  const handleCancel = () => {
    dispatch(setReportInEditSlice(null));
  };
  const [editing, setEditing] = useState(false);
  const [reportName, setReportName] = useState<string>(reportData.name);

  useEffect(() => {
    setReportName(reportData.name);
  }, [reportData.name]);

  useEffect(() => {
    if (reportData?.id !== formFieldId) {
      form.setFieldsValue({
        name: reportData.name,
        id: reportData.id,
      });
    }
  }, [reportData?.id]);

  return (
    <div className="flex h-full flex-col items-start justify-between gap-2 px-3">
      <div className="flex w-full flex-col items-start justify-start gap-4">
        <div
          className="flex w-full flex-col gap-4"
          onClick={() => setEditing(true)}
        >
          <Form
            form={form}
            name="titleEditForReportSettings"
            initialValues={{ name: reportData?.name, id: reportData?.id }}
          >
            <div className="flex w-full items-center gap-2 text-lg font-semibold">
              <Tooltip title={reportData.reportType.replace("_", " ")}>
                <div>{ReportIcons[reportData.reportType]}</div>
              </Tooltip>
              <Form.Item hidden={true} name="id" className="m-0">
                <Input />
              </Form.Item>
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
                  value={reportName}
                  onChange={(e) => {
                    const trimmedValue = e.target.value.trim();
                    if (trimmedValue && trimmedValue !== reportName)
                      setReportName(trimmedValue);
                  }}
                />
              </Form.Item>
            </div>
          </Form>
        </div>
        <div className="flex w-full flex-col items-start justify-start gap-4 py-5">
          {children}
        </div>
      </div>
      <div className="flex w-full justify-center gap-6 border-t-2 pt-4">
        <PrimaryButton onClick={() => saveConfig({ name: reportName })}>
          Save
        </PrimaryButton>
        <PrimaryButton onClick={handleCancel}> Cancel</PrimaryButton>
      </div>
    </div>
  );
};

export default ReportSettingsWrapper;
