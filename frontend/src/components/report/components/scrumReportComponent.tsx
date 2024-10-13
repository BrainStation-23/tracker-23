import React from "react";
import ScrumReportTabel from "./scrumReportTable";

type Props = {
  data: any;
  reportData: any;
};

const ScrumReportComponent = ({ data, reportData }: Props) => {
  return (
    <div className="flex w-full flex-col gap-5">
      <ScrumReportTabel data={data ? data : []} reportData={reportData} />
    </div>
  );
};

export default ScrumReportComponent;
