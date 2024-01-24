import {
  SprintViewReportColumn,
  SprintViewReportDto,
  SprintViewReportTableRow,
  SprintViewReportTask,
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
    if (!maxTasks) maxTasks = 0;
    for (let i = 0; i < maxTasks + 1; i++) {
      const tableRow: SprintViewReportTableRow = {
        ...row,
        userSpan: i === 0 ? maxTasks + 1 : 0,
        tasksSpan: 1,
        task: {},
        devProgress: {},
      };
      for (let column of data?.columns) {
        if (i > 0 && column.key !== "AssignTasks") {
          for (let colTask of row[column.key].tasks) {
            const taskIndex = row.AssignTasks.tasks?.findIndex(
              (task: SprintViewReportTask) => task.key === colTask.key
            );
            if (taskIndex === i - 1) {
              tableRow.task[column.key] = colTask;
              break;
            }
          }
        } else if (i > 0 && column.key === "AssignTasks") {
          tableRow.task[column.key] =
            row.AssignTasks.tasks.length > i - 1
              ? row.AssignTasks.tasks[i - 1]
              : undefined;
        }
        tableRow.devProgress[column.key] = row[column.key].devProgress;
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
