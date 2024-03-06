import { Avatar, Empty, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import classNames from "classnames";
import dayjs from "dayjs";
import {
  SprintViewTimelineReportColumn,
  SprintViewTimelineReportTableRow,
  SprintViewTimelineReportTask,
} from "models/reports";
import { TaskStatusEnum } from "models/tasks";

import TimeProgressComponent from "./timeProgressComponent";

const { Text } = Typography;
type Props = {
  data: {
    columns: SprintViewTimelineReportColumn[];
    rows: SprintViewTimelineReportTableRow[];
  };
};

const SprintViewTimelineReportTabel = ({ data }: Props) => {
  const renderTableTaskCell = (
    record: SprintViewTimelineReportTableRow,
    column: SprintViewTimelineReportColumn
  ) => {
    if (column.key in record.task || column.key in record.devProgress) {
      type cellType = "progress" | "assignedTask" | "task" | "noTask";
      let colSpan = 1;
      let cell: cellType =
        record.userSpan > 0
          ? "progress"
          : column.key !== "AssignTasks" && column.key in record.task
          ? "task"
          : column.key === "AssignTasks" && column.key in record.task
          ? "assignedTask"
          : "noTask";
      if (cell === "task" && column.key in record.timeRange) {
        if (column.key === record.timeRange[column.key].start) {
          const diff = dayjs(record.timeRange[column.key].end).diff(
            record.timeRange[column.key].start,
            "day"
          );
          if (!isNaN(diff)) {
            colSpan = Math.abs(diff) + 1;
          } else {
            //! This should not happen
            //! It will be happen when colum key in not a valid date string
            console.error(
              "Invalid Column key in timeRange: " +
                record.timeRange[column.key].start +
                " " +
                record.timeRange[column.key].end
            );
          }
        } else {
          colSpan = 0;
        }
      }

      return {
        children: (
          <div className="flex h-full w-full flex-col justify-start">
            {cell === "progress" ? (
              <div className="flex w-full items-center justify-center gap-2">
                <Text
                  className="w-[50px]"
                  ellipsis={{
                    tooltip: `Estimated: ${column.value.devProgress.estimatedTime.toFixed(
                      2
                    )}h, Spent: ${column.value.devProgress.spentTime.toFixed(
                      2
                    )}h`,
                  }}
                >
                  {column.value.devProgress.estimatedTime
                    ? `${Math.round(
                        (column.value.devProgress.spentTime /
                          column.value.devProgress.estimatedTime) *
                          100
                      )}%`
                    : ""}
                </Text>
                <TimeProgressComponent
                  spentTime={record.devProgress[column.key]?.spentTime}
                  estimatedTime={record.devProgress[column.key]?.estimatedTime}
                />
              </div>
            ) : cell === "task" ? (
              <div
                className={classNames(
                  `flex h-full w-full justify-start rounded`,
                  {
                    ["bg-gray-100"]:
                      record.task[column.key].statusCategoryName ===
                      TaskStatusEnum.TO_DO,
                    ["bg-statusInProgressBg"]:
                      record.task[column.key].statusCategoryName ===
                      TaskStatusEnum.IN_PROGRESS,
                    ["bg-statusDoneBg"]:
                      record.task[column.key].statusCategoryName ===
                      TaskStatusEnum.DONE,
                  }
                )}
              >
                <Text
                  key={record.task[column.key].key}
                  className={`h-[24px] w-[${
                    colSpan * 200
                  }px] cursor-pointer text-left`}
                  ellipsis={{ tooltip: record.task[column.key].title }}
                >
                  {record.task[column.key].title}
                </Text>
              </div>
            ) : cell === "assignedTask" ? (
              <div className="flex  w-full justify-start gap-2">
                <div className={`flex w-[200px] justify-start`}>
                  <Text
                    key={record.task[column.key].key}
                    className={classNames(`w-[200px] cursor-pointer`, {
                      ["text-statusToDo"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.TO_DO,
                      ["text-statusInProgress"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.IN_PROGRESS,
                      ["text-statusDone"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.DONE,
                    })}
                    ellipsis={{ tooltip: record.task[column.key].title }}
                  >
                    {record.task[column.key].title}
                  </Text>
                </div>
                <div
                  className={classNames(
                    "relative flex w-max items-center gap-1 rounded-[36px] border px-2 py-0.5 text-xs font-medium text-black",
                    {
                      ["bg-statusToDoBg"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.TO_DO,
                      ["bg-statusInProgressBg"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.IN_PROGRESS,
                      ["bg-statusDoneBg"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.DONE,

                      ["border-statusToDo"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.TO_DO,
                      ["border-statusInProgress"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.IN_PROGRESS,
                      ["border-statusDone"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.DONE,
                    }
                  )}
                >
                  <div
                    className={classNames("h-2 w-2 rounded-full", {
                      ["bg-statusToDo"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.TO_DO,
                      ["bg-statusInProgress"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.IN_PROGRESS,
                      ["bg-statusDone"]:
                        record.task[column.key].statusCategoryName ===
                        TaskStatusEnum.DONE,
                    })}
                  />

                  <div className="w-[80px]">
                    <Text
                      ellipsis={{ tooltip: record.task[column.key].status }}
                    >
                      {record.task[column.key].status}
                    </Text>
                  </div>
                </div>
              </div>
            ) : (
              <Text
                className="h-[24px] w-[200px] cursor-pointer"
                ellipsis={{ tooltip: "No assigned tasks" }}
              >
                {/* {"--"} */}
              </Text>
            )}
          </div>
        ),
        props: {
          rowSpan: record.tasksSpan,
          colSpan: colSpan,
          style: {
            paddingTop: 16,
            paddingBottom: 16,
            borderLeftWidth: cell == "task" || cell == "noTask" ? 0 : 1,
            borderRightWidth: cell == "task" || cell == "noTask" ? 0 : 1,
          },
        },
      };
    } else {
      return {
        children: (
          <Text
            className="w-[200px] cursor-pointer"
            ellipsis={{ tooltip: "No data" }}
          >
            {"--"}
          </Text>
        ),
        props: {
          rowSpan: record.tasksSpan,
        },
      };
    }
  };

  const columns: ColumnsType<SprintViewTimelineReportTableRow> = [
    {
      title: "Developer Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      render: (text: string, record: SprintViewTimelineReportTableRow) => {
        return {
          children: (
            <div className="justify-left mx-auto flex w-[150px] items-center gap-2 ">
              {record?.picture ? (
                <Avatar
                  src={record.picture}
                  alt="N"
                  className="h-[20px] w-[20px]"
                />
              ) : (
                <Avatar
                  src={
                    "https://st3.depositphotos.com/15437752/19006/i/600/depositphotos_190061104-stock-photo-silhouette-male-gradient-background-white.jpg"
                  }
                  alt="N"
                  className="h-[20px] w-[20px]"
                />
              )}
              {record.name}
            </div>
          ),
          props: {
            rowSpan: record.userSpan,
          },
        };
      },
      // align: "center",
    },
  ];
  data?.columns.forEach((column) => {
    if (column.key === "AssignTasks") {
      columns.push({
        title: (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex w-full items-center justify-center gap-2">
              <Text>
                Sprint Progress -{" "}
                {column.value.devProgress.estimatedTime > 0
                  ? `${Math.round(
                      (column.value.devProgress.spentTime /
                        column.value.devProgress.estimatedTime) *
                        100
                    )}%`
                  : ""}
              </Text>
              <div className="w-[100px]">
                <TimeProgressComponent
                  spentTime={column.value.devProgress.spentTime}
                  estimatedTime={column.value.devProgress.estimatedTime}
                />
              </div>
            </div>
            <div className="font-bold">Assigned Task</div>
          </div>
        ),
        dataIndex: "AssignTasks",
        key: "AssignTasks",
        fixed: "left",
        render: (
          value: SprintViewTimelineReportColumn,
          record: SprintViewTimelineReportTableRow
        ) => renderTableTaskCell(record, column),
        align: "center",
      });
    } else {
      const dateType: "Today" | "Yesterday" | "date" = dayjs(column.key).isSame(
        dayjs().subtract(1, "day"),
        "day"
      )
        ? "Yesterday"
        : dayjs(column.key).isSame(dayjs(), "day")
        ? "Today"
        : "date";
      columns.push({
        title: (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-[#1D1D1D]">
              {dateType === "date"
                ? dayjs(column.key).format("D MMM, YYYY")
                : dateType}{" "}
            </div>
            <div className="flex w-full items-center justify-center">
              <div className="h-6 w-6">
                <TimeProgressComponent
                  spentTime={column.value.devProgress.spentTime}
                  estimatedTime={column.value.devProgress.estimatedTime}
                  isDonut={true}
                />
              </div>
              <div>
                {column.value.devProgress.estimatedTime > 0
                  ? `${Math.round(
                      (column.value.devProgress.spentTime /
                        column.value.devProgress.estimatedTime) *
                        100
                    )}%`
                  : ""}
              </div>
            </div>
          </div>
        ),
        dataIndex: column.key,
        key: column.key,
        render: (
          value: SprintViewTimelineReportTask,
          record: SprintViewTimelineReportTableRow
        ) => renderTableTaskCell(record, column),
        align: "center",
      });
    }
  });

  return data && data?.columns.length > 0 && data?.rows.length > 0 ? (
    <div className="flex flex-col gap-4">
      <Table
        columns={columns}
        dataSource={data.rows}
        rowKey={"id"}
        bordered
        pagination={{
          current: 1,
          pageSize: 500,
          showSizeChanger: false,
          showLessItems: true,
          position: ["bottomRight", "bottomLeft"],
        }}
        scroll={{ x: true }}
      />
    </div>
  ) : (
    <Empty
      className="mt-12"
      description="Select Project And Sprint to View Data"
    />
  );
};

export default SprintViewTimelineReportTabel;
