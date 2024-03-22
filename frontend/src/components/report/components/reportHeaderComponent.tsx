import { MenuProps, message, Tooltip, Typography } from "antd";
import { userAPI } from "APIs";
import classNames from "classnames";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { ReportIcons } from "../reportPage";
import SecondaryButton from "@/components/common/buttons/secondaryButton";
import MoreButtonTopPanel from "@/components/common/topPanels/components/moreButtonTopPanel";
import {
  ReportData,
  deleteReportSlice,
  setReportInEditSlice,
} from "@/storage/redux/reportsSlice";

const { Text } = Typography;

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
  const dispatch = useDispatch();

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

  return (
    <div className={classNames("flex w-full flex-col gap-4 pb-3", className)}>
      <div className="flex w-full items-center justify-between gap-3 ">
        <div className="flex w-2/3 items-center gap-2 text-xl font-semibold">
          <Tooltip title={reportData.reportType.replace("_", " ")}>
            <div className="h-6 w-6">{ReportIcons[reportData.reportType]}</div>
          </Tooltip>
          <Tooltip title={`Edit: ${title}`}>
            <Text
              className="text-xl font-semibold text-[#3498DB] hover:cursor-pointer hover:underline"
              ellipsis={{ tooltip: title }}
              onClick={handleEdit}
            >
              {title}
            </Text>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          {exportButton}
          <MoreButtonTopPanel
            {...{ menuProps, dropdownOpen, setDropdownOpen }}
          />
        </div>
      </div>
      <div className="flex w-full flex-wrap items-center justify-end gap-2">
        {extraFilterComponent}
      </div>
    </div>
  );
}
