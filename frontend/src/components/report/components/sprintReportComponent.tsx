import TableComponentSprintReport from "./tableComponentSprintReport";
type Props = {
  data: any;
  // data: SprintTableData;
};
const SpritReportComponent = ({ data }: Props) => {
  const tableData = data?.rows;
  tableData?.forEach((td: any) => {
    td?.users?.forEach((ud: any) => {
      td[ud.userId] = ud;
    });
  });
  return <TableComponentSprintReport data={tableData} column={data?.columns} />;
};

export default SpritReportComponent;
