import { Avatar, Empty, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  SprintViewReportColumn,
  SprintViewReportTableRow,
  SprintViewReportTask,
} from "models/reports";
import dayjs from "dayjs";

import ProgressComponent from "./progressComponent";

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
    if (column.id in record && record[column.id]) {
      return {
        children: (
          <div className="flex w-full flex-col justify-start">
            {record.userSpan > 0 ? (
              <ProgressComponent
                done={record[column.id].devProgress?.done}
                total={record[column.id].devProgress?.total}
              />
            ) : record[column.id].tasks.length > 0 ? (
              <Text
                key={record[column.id].tasks[0].key}
                className={`w-[200px] cursor-pointer ${
                  record[column.id].tasks[0].status === "Done"
                    ? "line-through"
                    : ""
                }`}
                ellipsis={{ tooltip: record[column.id].tasks[0].title }}
              >
                {record[column.id].tasks[0].title}
              </Text>
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
      render: (
        text: string,
        record: SprintViewReportTableRow,
        index: number
      ) => {
        return {
          children: (
            <div className="justify-left mx-auto flex w-[200px] items-center gap-2 ">
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
    if (column.id === "AssignTasks") {
      columns.push({
        title: (
          <div className="flex flex-col items-center justify-center gap-4">
            <div>
              Sprint Overall Progress{" "}
              {Math.round(
                (column.value.devProgress.done /
                  column.value.devProgress.total) *
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
          record: SprintViewReportTableRow,
          _: number
        ) => renderTableTaskCell(record, column),
        align: "center",
      });
    } else if (column.id === "Yesterday" || column.id === "Today") {
      columns.push({
        title: (
          <div className="flex flex-col items-center justify-center gap-4">
            <div>
              {column.id} Progress{" "}
              {Math.round(
                (column.value.devProgress.done /
                  column.value.devProgress.total) *
                  100
              )}
              %
            </div>
            <div className="font-bold">{column.id}</div>
          </div>
        ),
        dataIndex: column.id,
        key: column.id,
        render: (
          value: SprintViewReportTask,
          record: SprintViewReportTableRow,
          _: number
        ) => renderTableTaskCell(record, column),
        align: "center",
      });
    } else {
      columns.push({
        title: (
          <div className="flex flex-col items-center justify-center gap-4">
            <div>
              {dayjs(column.id).format("D MMM")} Progress{" "}
              {Math.round(
                (column.value.devProgress.done /
                  column.value.devProgress.total) *
                  100
              )}
              %
            </div>
            <div className="font-bold">
              {dayjs(column.id).format("DD/MM/YYYY")}
            </div>
          </div>
        ),
        dataIndex: column.id,
        key: column.id,
        render: (
          value: SprintViewReportTask,
          record: SprintViewReportTableRow,
          _: number
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
