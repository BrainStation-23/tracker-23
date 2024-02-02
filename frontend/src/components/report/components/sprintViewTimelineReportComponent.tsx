import {
  SprintViewTimelineReportTableRow,
  SprintViewTimelineReportDto,
  SprintViewTimelineReportTask,
} from "models/reports";

import SprintViewTimelineReportTabel from "./sprintViewTimelineReportTabel";

type Props = {
  data: SprintViewTimelineReportDto;
};

const SprintViewTimelineReportComponent = ({ data }: Props) => {
  const rows = data?.rows?.length ? [...data?.rows] : [];
  const modifiedColumns = data?.columns?.length ? [...data?.columns] : [];

  const modifiedRows: SprintViewTimelineReportTableRow[] = [];

  for (let row of rows) {
    const AssignTasks = row.data.find((item) => item.key === "AssignTasks");
    const maxTasks = AssignTasks ? AssignTasks.value.tasks.length : 0;
    console.log("maxTasks: ", maxTasks);
    for (let i = 0; i < maxTasks + 1; i++) {
      const tableRow: SprintViewTimelineReportTableRow = {
        userId: row.userId,
        name: row.name,
        picture: row.picture,
        email: row.email,
        userSpan: i === 0 ? maxTasks + 1 : 0,
        tasksSpan: 1,
        task: {},
        timeRange: {},
        devProgress: {},
      };
      try {
        for (let rowData of row.data) {
          if (rowData.key !== "AssignTasks") {
            for (let colTask of rowData.value.tasks) {
              const taskIndex = AssignTasks.value.tasks?.findIndex(
                (task: SprintViewTimelineReportTask) => task.key === colTask.key
              );
              console.log("taskIndex: " + taskIndex);
              if (taskIndex === i - 1) {
                tableRow.task[rowData.key] = colTask;
                tableRow.timeRange[rowData.key] = colTask.timeRange;
                break;
              }
            }
          } else if (i > 0 && rowData.key === "AssignTasks") {
            tableRow.task[rowData.key] =
              AssignTasks.value.tasks.length > i - 1
                ? AssignTasks.value.tasks[i - 1]
                : undefined;
          }
          tableRow.devProgress[rowData.key] = rowData.value.devProgress;
        }
      } catch (e) {
        console.error(e);
      }
      modifiedRows.push(tableRow);
    }
  }

  console.log("modifiedRows", modifiedRows);

  return (
    <div className="flex w-full flex-col gap-5">
      <SprintViewTimelineReportTabel
        data={{
          columns: modifiedColumns,
          rows: modifiedRows,
        }}
      />
    </div>
  );
};

export default SprintViewTimelineReportComponent;
