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
  return <TableComponentSprintReport data={tableData} column={data?.columns} />;
};

export default SpritEstimateReportComponent;
