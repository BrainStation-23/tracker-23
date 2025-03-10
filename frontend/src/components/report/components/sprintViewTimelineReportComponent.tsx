import {
  SprintViewTimelineReportDto,
  SprintViewTimelineReportTableRow,
  SprintViewTimelineReportTask,
} from "models/reports";

import SprintViewTimelineReportTabel from "./sprintViewTimelineReportTabel";
import { ReportData } from "@/storage/redux/reportsSlice";

type Props = {
  data: SprintViewTimelineReportDto;
  reportData: ReportData;
};

const SprintViewTimelineReportComponent = ({ data, reportData }: Props) => {
  const rows = data?.rows?.length ? [...data?.rows] : [];
  const modifiedColumns = data?.columns?.length ? [...data?.columns] : [];

  const modifiedRows: SprintViewTimelineReportTableRow[] = [];
  let rowKey: number = 0;
  for (let row of rows) {
    const AssignTasks = row.data.find((item) => item.key === "AssignTasks");
    const maxTasks = AssignTasks ? AssignTasks.value.tasks.length : 0;
    for (let i = 0; i < maxTasks + 1; i++) {
      const tableRow: SprintViewTimelineReportTableRow = {
        rowKey,
        userId: row.userId,
        name: row.name,
        picture: row.picture,
        email: row.email,
        userSpan: i === 0 ? maxTasks + 1 : 0,
        groupRows: maxTasks + 1,
        groupRowIndex: i,
        tasksSpan: 1,
        task: {},
        timeRange: {},
        devProgress: {},
      };
      rowKey = rowKey + 1;
      try {
        for (let rowData of row.data) {
          if (rowData.key !== "AssignTasks") {
            for (let colTask of rowData.value.tasks) {
              const taskIndex = AssignTasks.value.tasks?.findIndex(
                (task: SprintViewTimelineReportTask) => task.key === colTask.key
              );
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

  return (
    <div className="flex w-full flex-col gap-5">
      <SprintViewTimelineReportTabel
        data={{
          columns: modifiedColumns,
          rows: modifiedRows,
        }}
        reportData={reportData}
      />
    </div>
  );
};

export default SprintViewTimelineReportComponent;
