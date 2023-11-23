import { SprintTableData } from "models/reports";
import TableComponentSprintReport from "./tableComponentSprintReport";
type Props = {
  data: SprintTableData;
};
const SpritReportComponent = ({ data }: Props) => {
  return (
    <>
      <TableComponentSprintReport data={data.rows} column={data.columns} />
    </>
  );
};

export default SpritReportComponent;
