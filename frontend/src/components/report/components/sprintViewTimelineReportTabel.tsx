import { Avatar, Empty, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  SprintViewTimelineReportTableRow,
  SprintViewTimelineReportColumn,
  SprintViewTimelineReportTask,
} from "models/reports";
import dayjs from "dayjs";
import TimeProgressComponent from "./timeProgressComponent";

const { Text } = Typography;
type Props = {
  data: {
    columns: SprintViewTimelineReportColumn[];
    rows: SprintViewTimelineReportTableRow[];
  };
};

const SprintViewTimelineReportTabel = ({ data }: Props) => {
  console.log("data:", data);
  const renderTableTaskCell = (
    record: SprintViewTimelineReportTableRow,
    column: SprintViewTimelineReportColumn,
    columnIndex: number
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
              <TimeProgressComponent
                spentTime={record.devProgress[column.key]?.spentTime}
                estimatedTime={record.devProgress[column.key]?.estimatedTime}
              />
            ) : cell === "task" ? (
              <div
                className={`flex h-full w-full justify-start rounded ${
                  record.task[column.key].status === "Done"
                    ? "bg-[#6CAE2B33]"
                    : "bg-[#E7F4F8]"
                }`}
              >
                <Text
                  key={record.task[column.key].key}
                  className={`h-[24px] w-[200px] cursor-pointer`}
                  ellipsis={{ tooltip: record.task[column.key].title }}
                >
                  {record.task[column.key].title}
                </Text>
              </div>
            ) : cell === "assignedTask" ? (
              <div className="flex  w-[300px] justify-start gap-2">
                <div className={`flex justify-start`}>
                  <Text
                    key={record.task[column.key].key}
                    className={`cursor-pointer ${
                      record.task[column.key].status === "Done"
                        ? "text-[#65656C] line-through"
                        : "text-[#1D1D1D]"
                    }`}
                    ellipsis={{ tooltip: record.task[column.key].title }}
                  >
                    {record.task[column.key].title}
                  </Text>
                </div>
                <div
                  className={`flex justify-start rounded-lg px-2 ${
                    record.task[column.key].status === "Done"
                      ? "bg-[#6CAE2B33]"
                      : "bg-[#E7F4F8]"
                  }`}
                >
                  <Text
                    key={record.task[column.key].key}
                    className={`cursor-pointer`}
                    ellipsis={{ tooltip: record.task[column.key].status }}
                  >
                    {record.task[column.key].status}
                  </Text>
                </div>
              </div>
            ) : (
              <Text
                className="w-[200px] cursor-pointer"
                ellipsis={{ tooltip: "No assigned tasks" }}
              >
                {"--"}
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
            // paddingLeft: 0,
            // paddingRight: 0,
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
      render: (
        text: string,
        record: SprintViewTimelineReportTableRow,
        index: number
      ) => {
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
  data?.columns.forEach((column, index) => {
    if (column.key === "AssignTasks") {
      columns.push({
        title: (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex w-full items-center justify-center gap-2">
              <Text>
                Sprint Progress -{" "}
                {Math.round(
                  (column.value.devProgress.spentTime /
                    column.value.devProgress.estimatedTime) *
                    100
                )}
                %
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
          record: SprintViewTimelineReportTableRow,
          _: number
        ) => renderTableTaskCell(record, column, index),
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
                {Math.round(
                  (column.value.devProgress.spentTime /
                    column.value.devProgress.estimatedTime) *
                    100
                )}
                %
              </div>
            </div>
          </div>
        ),
        dataIndex: column.key,
        key: column.key,
        render: (
          value: SprintViewTimelineReportTask,
          record: SprintViewTimelineReportTableRow,
          _: number
        ) => renderTableTaskCell(record, column, index),
        align: "center",
      });
    }
  });

  return data && data?.columns.length > 0 && data?.rows.length > 0 ? (
    <div className="flex flex-col gap-4">
      <Table
        columns={columns}
        dataSource={data.rows}
        // onChange={onChange}
        rowKey={"id"}
        bordered
        pagination={{
          current: 1,
          pageSize: 500,
          showSizeChanger: false,
          showLessItems: true,
          position: ["bottomRight", "bottomLeft"],
          // total: 100,
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
