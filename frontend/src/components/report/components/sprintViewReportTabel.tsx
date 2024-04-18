import { Avatar, Empty, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  SprintViewReportColumn,
  SprintViewReportTableRow,
  SprintViewReportTask,
} from "models/reports";
import dayjs from "dayjs";
import TimeProgressComponent from "./timeProgressComponent";

const { Text } = Typography;
type Props = {
  data: {
    columns: SprintViewReportColumn[];
    rows: SprintViewReportTableRow[];
  };
};

const SprintViewReportTabel = ({ data }: Props) => {
  const renderTableTaskCell = (
    record: SprintViewReportTableRow,
    column: SprintViewReportColumn
  ) => {
    if (column.key in record) {
      return {
        children: (
          <div className="flex h-full w-full flex-col justify-start">
            {record.userSpan > 0 ? (
              <TimeProgressComponent
                spentTime={record.devProgress[column.key]?.spentTime}
                estimatedTime={record.devProgress[column.key]?.estimatedTime}
              />
            ) : column.key !== "AssignTasks" && column.key in record.task ? (
              <div
                className={`flex h-full w-full justify-start ${
                  record.task[column.key].status === "Done"
                    ? "bg-[#6CAE2B33]"
                    : "bg-[#E7F4F8]"
                }`}
              >
                <Text
                  key={record.task[column.key].key}
                  className={`h-[24px] w-[200px] cursor-pointer ${
                    record.task[column.key].status === "Done"
                      ? "line-through"
                      : ""
                  }`}
                  ellipsis={{ tooltip: record.task[column.key].title }}
                >
                  {record.task[column.key].title}
                </Text>
              </div>
            ) : column.key === "AssignTasks" && column.key in record.task ? (
              <div
                className={`flex w-full justify-start ${
                  record.task[column.key].status === "Done"
                    ? "bg-[#6CAE2B33]"
                    : "bg-[#E7F4F8]"
                }`}
              >
                <Text
                  key={record.task[column.key].key}
                  className={`w-[200px] cursor-pointer ${
                    record.task[column.key].status === "Done"
                      ? "line-through"
                      : ""
                  }`}
                  ellipsis={{ tooltip: record.task[column.key].title }}
                >
                  {record.task[column.key].title}
                </Text>
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

  const columns: ColumnsType<SprintViewReportTableRow> = [
    {
      title: "Developer Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      render: (text: string, record: SprintViewReportTableRow) => {
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
            <div>
              Sprint Overall Progress{" "}
              {Math.round(
                (column.value.devProgress.spentTime /
                  column.value.devProgress.estimatedTime) *
                  100
              )}
              %
            </div>
            <div className="font-bold">Assigned Task</div>
          </div>
        ),
        dataIndex: "AssignTasks",
        key: "AssignTasks",
        fixed: "left",
        render: (
          value: SprintViewReportTask,
          record: SprintViewReportTableRow
        ) => renderTableTaskCell(record, column),
        align: "center",
      });
    } else if (column.key === "Yesterday" || column.key === "Today") {
      columns.push({
        title: (
          <div className="flex flex-col items-center justify-center gap-4">
            <div>
              {column.key} Progress{" "}
              {Math.round(
                (column.value.devProgress.spentTime /
                  column.value.devProgress.estimatedTime) *
                  100
              )}
              %
            </div>
            <div className="font-bold">{column.key}</div>
          </div>
        ),
        dataIndex: column.key,
        key: column.key,
        render: (
          value: SprintViewReportTask,
          record: SprintViewReportTableRow
        ) => renderTableTaskCell(record, column),
        align: "center",
      });
    } else {
      columns.push({
        title: (
          <div className="flex flex-col items-center justify-center gap-4">
            <div>
              {dayjs(column.key).format("D MMM")} Progress{" "}
              {Math.round(
                (column.value.devProgress.spentTime /
                  column.value.devProgress.estimatedTime) *
                  100
              )}
              %
            </div>
            <div className="font-bold">
              {dayjs(column.key).format("DD/MM/YYYY")}
            </div>
          </div>
        ),
        dataIndex: column.key,
        key: column.key,
        render: (
          value: SprintViewReportTask,
          record: SprintViewReportTableRow
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

export default SprintViewReportTabel;
