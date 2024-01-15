import {
  NewSprintViewReportTableRow,
  SprintViewReportColumn,
  SprintViewReportDto,
  SprintViewReportTableRow,
  SprintViewReportTask,
} from "models/reports";

import SprintViewReportTabel from "./sprintViewReportTabel";
import NewSprintViewReportTabel from "./newSprintViewReportTabel";

const dummayData: any = {
  columns: [
    {
      id: "AssignTasks",
      value: { devProgress: { estimatedTime: 10, spentTime: 7 } },
    },
    {
      id: "2024-01-08T08:24:18.123Z",
      value: { devProgress: { estimatedTime: 10, spentTime: 7 } },
    },
    {
      id: "2024-01-09T08:24:18.123Z",
      value: { devProgress: { estimatedTime: 10, spentTime: 7 } },
    },
    {
      id: "2024-01-10T08:24:18.123Z",
      value: { devProgress: { estimatedTime: 10, spentTime: 7 } },
    },
    {
      id: "2024-01-11T08:24:18.123Z",
      value: { devProgress: { estimatedTime: 10, spentTime: 7 } },
    },
    {
      id: "2024-01-12T08:24:18.123Z",
      value: { devProgress: { estimatedTime: 10, spentTime: 7 } },
    },
    {
      id: "2024-01-13T08:24:18.123Z",
      value: { devProgress: { estimatedTime: 10, spentTime: 7 } },
    },
    {
      id: "2024-01-14T08:24:18.123Z",
      value: { devProgress: { estimatedTime: 10, spentTime: 7 } },
    },
    {
      id: "Yesterday",
      value: { devProgress: { estimatedTime: 10, spentTime: 7 } },
    },
    {
      id: "Today",
      value: { devProgress: { estimatedTime: 10, spentTime: 7 } },
    },
  ],
  rows: [
    {
      userId: 101,
      name: "John Doe",
      picture: "https://example.com/johndoe.jpg",
      email: "john.doe@example.com",
      AssignTasks: {
        devProgress: { estimatedTime: 10, spentTime: 7 },
        tasks: [
          {
            title: "Feature A",
            key: "PROJ-123",
            status: "In Progress",
            statusCategoryName: "InProgress",
          },
          {
            title: "Bug Fix B",
            key: "PROJ-124",
            status: "To Do",
            statusCategoryName: "ToDo",
          },
          {
            title: "Refactor C",
            key: "PROJ-125",
            status: "Done",
            statusCategoryName: "Done",
          },
        ],
      },
      "2024-01-08T08:24:18.123Z": {
        devProgress: { estimatedTime: 10, spentTime: 7 },
        tasks: [
          {
            title: "Feature A",
            key: "PROJ-123",
            status: "In Progress",
            statusCategoryName: "InProgress",
            timeRange: {
              start: "2024-01-08T08:24:18.123Z",
              end: "2024-01-08T08:24:18.123Z",
            },
          },
        ],
      },
      "2024-01-09T08:24:18.123Z": {
        devProgress: { estimatedTime: 10, spentTime: 7 },
        tasks: [
          {
            title: "Bug Fix B",
            key: "PROJ-124",
            status: "In Review",
            statusCategoryName: "InReview",
            timeRange: {
              start: "2024-01-09T08:24:18.123Z",
              end: "2024-01-09T08:24:18.123Z",
            },
          },
        ],
      },
      "2024-01-10T08:24:18.123Z": {
        devProgress: { estimatedTime: 10, spentTime: 7 },
        tasks: [
          {
            title: "Refactor C",
            key: "PROJ-125",
            status: "Done",
            statusCategoryName: "Done",
            timeRange: {
              start: "2024-01-10T08:24:18.123Z",
              end: "2024-01-12T08:24:18.123Z",
            },
          },
        ],
      },
      "2024-01-11T08:24:18.123Z": {
        devProgress: { estimatedTime: 10, spentTime: 7 },
        tasks: [
          {
            title: "Refactor C",
            key: "PROJ-125",
            status: "Done",
            statusCategoryName: "Done",
            timeRange: {
              start: "2024-01-10T08:24:18.123Z",
              end: "2024-01-12T08:24:18.123Z",
            },
          },
        ],
      },
      "2024-01-12T08:24:18.123Z": {
        devProgress: { estimatedTime: 10, spentTime: 7 },
        tasks: [
          {
            title: "Refactor C",
            key: "PROJ-125",
            status: "Done",
            statusCategoryName: "Done",
            timeRange: {
              start: "2024-01-10T08:24:18.123Z",
              end: "2024-01-12T08:24:18.123Z",
            },
          },
        ],
      },
      "2024-01-13T08:24:18.123Z": {
        devProgress: { estimatedTime: 10, spentTime: 7 },
        tasks: [],
      },
      "2024-01-14T08:24:18.123Z": {
        devProgress: { estimatedTime: 10, spentTime: 7 },
        tasks: [],
      },
      Yesterday: {
        devProgress: { estimatedTime: 10, spentTime: 7 },
        tasks: [
          {
            title: "Feature A",
            key: "PROJ-123",
            status: "Done",
            statusCategoryName: "Done",
            timeRange: {
              start: "Yesterday",
              end: "Yesterday",
            },
          },
        ],
      },
      Today: {
        devProgress: { estimatedTime: 10, spentTime: 7 },
        tasks: [
          {
            title: "Feature A",
            key: "PROJ-123",
            status: "In Progress",
            statusCategoryName: "InProgress",
            timeRange: {
              start: "Today",
              end: "Today",
            },
          },
          {
            title: "Bug Fix B",
            key: "PROJ-124",
            status: "In Review",
            statusCategoryName: "InReview",
            timeRange: {
              start: "Today",
              end: "Today",
            },
          },
        ],
      },
    },
    // {
    //   userId: 102,
    //   name: "Jane Smith",
    //   picture: "https://example.com/janesmith.jpg",
    //   email: "jane.smith@example.com",
    //   AssignTasks: {
    //     devProgress: { estimatedTime: 10, spentTime: 10 },
    //     tasks: [
    //       {
    //         title: "Feature X",
    //         key: "PROJ-126",
    //         status: "To Do",
    //         statusCategoryName: "ToDo",
    //       },
    //       {
    //         title: "Bug Fix Y",
    //         key: "PROJ-127",
    //         status: "In Progress",
    //         statusCategoryName: "InProgress",
    //       },
    //       {
    //         title: "Refactor Z",
    //         key: "PROJ-128",
    //         status: "Done",
    //         statusCategoryName: "Done",
    //       },
    //     ],
    //   },
    //   "2024-01-08T08:24:18.123Z": {
    //     devProgress: { estimatedTime: 10, spentTime: 7 },
    //     tasks: [
    //       {
    //         title: "Feature X",
    //         key: "PROJ-126",
    //         status: "To Do",
    //         statusCategoryName: "ToDo",
    //         timeRange: {
    //           start: "2024-01-08T08:24:18.123Z",
    //           end: "2024-01-09T08:24:18.123Z",
    //         },
    //       },
    //       {
    //         title: "Bug Fix Y",
    //         key: "PROJ-127",
    //         status: "In Progress",
    //         statusCategoryName: "InProgress",
    //         timeRange: {
    //           start: "2024-01-08T08:24:18.123Z",
    //           end: "2024-01-09T08:24:18.123Z",
    //         },
    //       },
    //     ],
    //   },
    //   "2024-01-09T08:24:18.123Z": {
    //     devProgress: { estimatedTime: 10, spentTime: 7 },
    //     tasks: [
    //       {
    //         title: "Bug Fix Y",
    //         key: "PROJ-127",
    //         status: "In Progress",
    //         statusCategoryName: "InProgress",
    //         timeRange: {
    //           start: "2024-01-08T08:24:18.123Z",
    //           end: "2024-01-09T08:24:18.123Z",
    //         },
    //       },
    //     ],
    //   },
    //   "2024-01-10T08:24:18.123Z": {
    //     devProgress: { estimatedTime: 10, spentTime: 7 },
    //     tasks: [
    //       {
    //         title: "Refactor Z",
    //         key: "PROJ-128",
    //         status: "Done",
    //         statusCategoryName: "Done",
    //         timeRange: {
    //           start: "2024-01-10T08:24:18.123Z",
    //           end: "2024-01-10T08:24:18.123Z",
    //         },
    //       },
    //     ],
    //   },
    //   "2024-01-11T08:24:18.123Z": {
    //     devProgress: { estimatedTime: 10, spentTime: 7 },
    //     tasks: [],
    //   },
    //   "2024-01-12T08:24:18.123Z": {
    //     devProgress: { estimatedTime: 10, spentTime: 7 },
    //     tasks: [],
    //   },
    //   "2024-01-13T08:24:18.123Z": {
    //     devProgress: { estimatedTime: 10, spentTime: 7 },
    //     tasks: [],
    //   },
    //   "2024-01-14T08:24:18.123Z": {
    //     devProgress: { estimatedTime: 10, spentTime: 7 },
    //     tasks: [],
    //   },
    //   Yesterday: {
    //     devProgress: { estimatedTime: 10, spentTime: 7 },
    //     tasks: [
    //       {
    //         title: "Feature X",
    //         key: "PROJ-126",
    //         status: "Done",
    //         statusCategoryName: "Done",
    //         timeRange: {
    //           start: "Yesterday",
    //           end: "Yesterday",
    //         },
    //       },
    //     ],
    //   },
    //   Today: {
    //     devProgress: { estimatedTime: 10, spentTime: 7 },
    //     tasks: [
    //       {
    //         title: "Feature X",
    //         key: "PROJ-126",
    //         status: "To Do",
    //         statusCategoryName: "ToDo",
    //         timeRange: {
    //           start: "Today",
    //           end: "Today",
    //         },
    //       },
    //       {
    //         title: "Bug Fix Y",
    //         key: "PROJ-127",
    //         status: "In Progress",
    //         statusCategoryName: "InProgress",
    //         timeRange: {
    //           start: "Today",
    //           end: "Today",
    //         },
    //       },
    //     ],
    //   },
    // },
  ],
};

type Props = {
  data: SprintViewReportDto;
};

const NewSprintViewReportComponent = ({ data }: Props) => {
  // const rows = data ? [...data?.rows] : [];
  // const modifiedColumns: SprintViewReportColumn[] = data
  //   ? [...data?.columns]
  //   : [];
  const rows = dummayData.rows;
  const modifiedColumns: SprintViewReportColumn[] = dummayData.columns;

  const modifiedRows: NewSprintViewReportTableRow[] = [];

  for (let row of rows) {
    let maxTasks = Math.max(
      row.AssignTasks.tasks.length,
      row.Yesterday.tasks.length,
      row.Today.tasks.length
    );
    if (!maxTasks) maxTasks = 0;
    console.log("maxTasks: ", maxTasks);
    for (let i = 0; i < maxTasks + 1; i++) {
      const tableRow: NewSprintViewReportTableRow = {
        ...row,
        userSpan: i === 0 ? maxTasks + 1 : 0,
        tasksSpan: 1,
        task: {},
        timeRange: {},
        devProgress: {},
      };
      try {
        for (let column of dummayData?.columns) {
          if (i > 0 && column.id !== "AssignTasks") {
            for (let colTask of row[column.id].tasks) {
              const taskIndex = row.AssignTasks.tasks?.findIndex(
                (task: SprintViewReportTask) => task.key === colTask.key
              );
              if (taskIndex === i - 1) {
                tableRow.task[column.id] = colTask;
                tableRow.timeRange[column.id] = colTask.timeRange;
                break;
              }
            }
          } else if (i > 0 && column.id === "AssignTasks") {
            tableRow.task[column.id] =
              row.AssignTasks.tasks.length > i - 1
                ? row.AssignTasks.tasks[i - 1]
                : undefined;
          }
          tableRow.devProgress[column.id] = row[column.id].devProgress;
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
      <NewSprintViewReportTabel
        data={{
          columns: modifiedColumns,
          rows: modifiedRows,
        }}
      />
    </div>
  );
};

export default NewSprintViewReportComponent;
