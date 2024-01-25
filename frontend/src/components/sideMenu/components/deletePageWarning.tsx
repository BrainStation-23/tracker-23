import { Button, Spin } from "antd";
import { userAPI } from "APIs";
import { useState } from "react";
import { useDispatch } from "react-redux";

import {
  deleteReportPageSlice,
  ReportPageDto,
} from "@/storage/redux/reportsSlice";

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
      }
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
        <div className="flex flex-col items-center gap-3 py-12">
          <div>
            Do you want to Delete{" "}
            <span className="font-bold">{page?.name}</span> Page
          </div>
          <div className="flex w-40 justify-between">
            <Button
              onClick={() => {
                handleWarningClick(true);
              }}
            >
              Yes
            </Button>
            <Button
              danger
              onClick={() => {
                handleWarningClick(false);
              }}
            >
              no
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteReportPageWarning;
