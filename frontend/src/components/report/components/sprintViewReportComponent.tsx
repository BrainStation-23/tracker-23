import {
  SprintViewReportColumn,
  SprintViewReportDto,
  SprintViewReportTableRow,
} from "models/reports";

import SprintViewReportTabel from "./sprintViewReportTabel";

type Props = {
  data: SprintViewReportDto;
};

const SprintViewReportComponent = ({ data }: Props) => {
  const rows = data ? [...data?.rows] : [];
  const modifiedColumns: SprintViewReportColumn[] = data
    ? [...data?.columns]
    : [];
  const modifiedRows: SprintViewReportTableRow[] = [];

  for (let row of rows) {
    let maxTasks = Math.max(
      row.AssignTasks.tasks.length,
      row.Yesterday.tasks.length,
      row.Today.tasks.length
    );
    for (let i = 0; i < maxTasks + 1; i++) {
      const tableRow: SprintViewReportTableRow = {
        ...row,
        userSpan: i === 0 ? maxTasks + 1 : 0,
        tasksSpan: 1,
      };
      for (let column of data?.columns) {
        tableRow[column.id] = {
          devProgress: row[column.id].devProgress,
          tasks: i === 0 ? [] : row[column.id].tasks.slice(i - 1, i),
        };
      }
      modifiedRows.push(tableRow);
    }
  }

  console.log("modifiedRows", modifiedRows);

  return (
    <div className="flex w-full flex-col gap-5">
      <SprintViewReportTabel
        data={{
          columns: modifiedColumns,
          rows: modifiedRows,
        }}
      />
    </div>
  );
};

export default SprintViewReportComponent;
