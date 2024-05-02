import { useAppSelector } from "@/storage/redux";
import { ReportData, setReportInEditSlice } from "@/storage/redux/reportsSlice";
import { RootState } from "@/storage/redux/store";
import { Button, message } from "antd";
import React from "react";
import { useDispatch } from "react-redux";

export default function EditReportConfigComponent({
  reportData,
  title,
}: {
  reportData: ReportData;
  title?: string;
}) {
  const dispatch = useDispatch();
  const reportInEdit = useAppSelector(
    (state: RootState) => state.reportsSlice.reportInEdit
  );
  function handleEdit() {
    if (reportInEdit && reportData.id !== reportInEdit.id) {
      message.error(
        "Report is already in edit. Please save or cancel the previous report to edit different report"
      );
    } else {
      dispatch(setReportInEditSlice(reportData));
    }
  }

  return (
    <Button
      type="text"
      onClick={handleEdit}
      className="bg-black text-white hover:text-white focus:text-white"
    >
      {title ?? "Edit Report"}
    </Button>
  );
}
