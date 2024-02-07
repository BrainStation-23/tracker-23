import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import { ReportData, setReportInEditSlice } from "@/storage/redux/reportsSlice";

type Props = {
  reportData: ReportData;
  children: React.ReactNode;
  saveConfig: Function;
};
const ReportSettingsWrapper = ({ reportData, children, saveConfig }: Props) => {
  const dispatch = useDispatch();
  const handleCancel = () => {
    dispatch(setReportInEditSlice(null));
  };
  return (
    <div className="flex h-full flex-col items-center justify-between gap-2 py-5 px-3">
      <div className="flex flex-col items-center justify-center gap-4 py-5 px-3">
        <div className="float-left w-full text-lg font-semibold">
          {reportData.name}
        </div>
        <div className="flex flex-col gap-4 py-5">{children}</div>
      </div>
      <div className="flex w-full justify-center gap-6 border-t-2 pt-4">
        <PrimaryButton onClick={() => saveConfig()}> Save</PrimaryButton>
        <PrimaryButton onClick={() => handleCancel()}> Cancel</PrimaryButton>
      </div>
    </div>
  );
};

export default ReportSettingsWrapper;
