import { SprintViewReportDto } from "models/reports";

import SprintViewReportTabel from "./sprintViewReportTabel";

type Props = {
  data: SprintViewReportDto;
};

const SprintViewReportComponent = ({ data }: Props) => {
  const rows = data ? [...data?.rows] : [];
  const columns = data ? [...data?.columns] : [];

  return (
    <div className="flex w-full flex-col gap-5">
      <SprintViewReportTabel
        data={{
          columns,
          rows,
        }}
      />
    </div>
  );
};

export default SprintViewReportComponent;
