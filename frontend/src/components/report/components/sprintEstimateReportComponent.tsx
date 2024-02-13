import { Empty } from "antd";

import TableComponentSprintReport from "./tableComponentSprintReport";

type Props = {
  data: any;
};
const SpritEstimateReportComponent = ({ data }: Props) => {
  const tableData = data?.rows;
  tableData?.forEach((td: any) => {
    td?.users?.forEach((ud: any) => {
      td[ud.userId] = ud;
    });
  });
  return (
    <div className="flex w-full">
      {tableData?.length > 0 ? (
        <TableComponentSprintReport data={tableData} column={data?.columns} />
      ) : (
        <Empty className="mt-12" description="No Data" />
      )}
    </div>
  );
};

export default SpritEstimateReportComponent;
