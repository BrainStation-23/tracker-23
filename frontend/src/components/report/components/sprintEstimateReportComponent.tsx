import { Empty } from "antd";

import TableComponentSprintReport from "./tableComponentSprintReport";
import { ReportData } from "@/storage/redux/reportsSlice";
import EditReportConfigComponent from "./editReportConfigComponent";

type Props = {
  data: any;
  reportData: ReportData;
};
const SpritEstimateReportComponent = ({ data, reportData }: Props) => {
  const tableData = data?.rows;
  tableData?.forEach((td: any) => {
    td?.users?.forEach((ud: any) => {
      td[ud.userId] = ud;
    });
  });
  return (
    <div className="flex w-full justify-center">
      {tableData?.length > 0 ? (
        <TableComponentSprintReport data={tableData} column={data?.columns} />
      ) : (
        <Empty className="mt-12" description="No Data">
          <EditReportConfigComponent reportData={reportData} />
        </Empty>
      )}
    </div>
  );
};

export default SpritEstimateReportComponent;
