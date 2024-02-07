import { message, Spin } from "antd";
import { userAPI } from "APIs";
import { useState } from "react";
import { useDispatch } from "react-redux";

import {
  deleteReportPageSlice,
  ReportPageDto,
} from "@/storage/redux/reportsSlice";
import PrimaryButton from "@/components/common/buttons/primaryButton";
import SecondaryButton from "@/components/common/buttons/secondaryButton";

const DeleteReportPageWarning = ({
  page,
  setIsModalOpen,
}: {
  page: ReportPageDto;
  setIsModalOpen: Function;
}) => {
  const [spinning, setSpinning] = useState(false);
  const dispatch = useDispatch();
  const handleWarningClick = async (yes: boolean) => {
    setSpinning(true);
    if (yes) {
      const res = await userAPI.deleteReportPage(page.id);
      if (res) {
        dispatch(deleteReportPageSlice(page));
        message.success("Page deleted successfully");
      } else message.error("Failed to delete report page");
    }
    setIsModalOpen(false);
    setSpinning(false);
  };
  return (
    <>
      {spinning ? (
        <div className=" mx-auto flex h-60 w-20 flex-col justify-center">
          <Spin tip="Working" size="large">
            <div className="content" />
          </Spin>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5 py-12">
          <div>
            Do you want to Delete{" "}
            <span className="font-bold">{page?.name}</span> Page
          </div>
          <div className="flex w-40 justify-between">
            <PrimaryButton
              onClick={() => {
                handleWarningClick(true);
              }}
            >
              Yes
            </PrimaryButton>
            <SecondaryButton
              // danger
              onClick={() => {
                handleWarningClick(false);
              }}
            >
              Cancel
            </SecondaryButton>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteReportPageWarning;
