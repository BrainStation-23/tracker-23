import { ReportData, setReportInEditSlice } from "@/storage/redux/reportsSlice";
import { Button } from "antd";
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
  function handleEdit() {
    dispatch(setReportInEditSlice(reportData));
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
