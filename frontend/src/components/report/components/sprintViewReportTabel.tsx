import { Avatar, Empty, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  SprintViewReportDto,
  SprintViewReportRow,
  SprintViewReportTask,
} from "models/reports";
import dayjs from "dayjs";

import ProgressComponent from "./progressComponent";

const { Text } = Typography;
type Props = {
  data: SprintViewReportDto;
};

const SprintViewReportTabel = ({ data }: Props) => {
  const columns: ColumnsType<SprintViewReportRow> = [
    {
      title: "Developer Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      render: (text: string, record: SprintViewReportRow, index: number) => {
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
            rowSpan: 1, // record.AssignTasks.tasks.length,
            // style: record.style,
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
          assignedTask: SprintViewReportTask,
          record: SprintViewReportRow,
          _: number
        ) => {
          if (record?.AssignTasks && record.AssignTasks.tasks.length > 0) {
            return {
              children: (
                <div className="flex flex-col justify-center gap-4">
                  <div className="w-full">
                    <ProgressComponent
                      done={record?.AssignTasks.devProgress?.done}
                      total={record?.AssignTasks.devProgress?.total}
                    />
                  </div>
                  <div className="flex flex-col justify-start gap-1">
                    {record.AssignTasks.tasks.map(
                      (task: SprintViewReportTask) => (
                        <Text
                          key={task.key}
                          className="w-[200px] cursor-pointer"
                          ellipsis={{ tooltip: assignedTask?.title }}
                        >
                          {task.title}
                        </Text>
                      )
                    )}
                  </div>
                </div>
              ),
              props: {
                rowSpan: 1,
              },
            };
          } else {
            return {
              children: (
                <Text
                  className="w-[200px] cursor-pointer"
                  ellipsis={{ tooltip: "No assigned tasks" }}
                >
                  {"--"}
                </Text>
              ),
              props: {
                rowSpan: 1,
              },
            };
          }
        },
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
          assignedTask: SprintViewReportTask,
          record: SprintViewReportRow,
          _: number
        ) => {
          if (
            column.id in record &&
            record[column.id] &&
            record[column.id].tasks.length > 0
          ) {
            return {
              children: (
                <div className="flex flex-col justify-start gap-4">
                  <div className="w-full">
                    <ProgressComponent
                      done={record[column.id].devProgress?.done}
                      total={record[column.id].devProgress?.total}
                    />
                  </div>
                  <div className="flex flex-col justify-start gap-1">
                    {record[column.id].tasks.map(
                      (task: SprintViewReportTask) => (
                        <Text
                          key={task.key}
                          className="w-[200px] cursor-pointer"
                          ellipsis={{ tooltip: task.title }}
                        >
                          {task.title}
                        </Text>
                      )
                    )}
                  </div>
                </div>
              ),
              props: {
                rowSpan: 1,
              },
            };
          } else {
            return {
              children: (
                <Text
                  className="w-[200px] cursor-pointer"
                  ellipsis={{ tooltip: "No assigned tasks" }}
                >
                  {"--"}
                </Text>
              ),
              props: {
                rowSpan: 1,
              },
            };
          }
        },
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
          assignedTask: SprintViewReportTask,
          record: SprintViewReportRow,
          _: number
        ) => {
          if (
            column.id in record &&
            record[column.id] &&
            record[column.id].tasks.length > 0
          ) {
            return {
              children: (
                <div className="flex flex-col gap-4">
                  <div className="w-full">
                    <ProgressComponent
                      done={record[column.id].devProgress?.done}
                      total={record[column.id].devProgress?.total}
                    />
                  </div>
                  <div className="flex flex-col  gap-1">
                    {record[column.id].tasks.map(
                      (task: SprintViewReportTask) => (
                        <Text
                          key={task.key}
                          className="w-[200px] cursor-pointer"
                          ellipsis={{ tooltip: task.title }}
                        >
                          {task.title}
                        </Text>
                      )
                    )}
                  </div>
                </div>
              ),
              props: {
                rowSpan: 1,
                align: "top",
              },
            };
          } else {
            return {
              children: (
                <Text
                  className="w-[200px] cursor-pointer"
                  ellipsis={{ tooltip: "No assigned tasks" }}
                >
                  {"--"}
                </Text>
              ),
              props: {
                rowSpan: 1,
              },
            };
          }
        },
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
