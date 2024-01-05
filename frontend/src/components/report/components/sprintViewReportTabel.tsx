import { Avatar, Empty, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import {
  SprintViewReportDto,
  SprintViewReportRow,
  SprintViewReportTask,
} from "models/reports";

import ProgressComponent from "./progressComponent";

const { Text } = Typography;
type Props = {
  data: SprintViewReportDto;
};

const SprintViewReportTabel = ({ data }: Props) => {
  const columns: ColumnsType<SprintViewReportRow> = data?.columns?.map(
    (columnName) => {
      if (columnName === "Name") {
        return {
          title: "Developer Name",
          dataIndex: "name",
          key: "name",
          fixed: "left",
          render: (
            text: string,
            record: SprintViewReportRow,
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
                rowSpan: 1, // record.AssignTasks.tasks.length,
                // style: record.style,
              },
            };
          },
          // align: "center",
        };
      } else if (columnName === "AssignTasks") {
        return {
          title: (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-blue-200">Sprint Overall Progress __%</div>
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
        };
      } else {
        return {
          title: (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="bg-blue-200">{columnName} Progress __%</div>
              <div className="font-bold">{columnName}</div>
            </div>
          ),
          dataIndex: `${columnName}`,
          key: `${columnName}`,
          render: (
            assignedTask: SprintViewReportTask,
            record: SprintViewReportRow,
            _: number
          ) => {
            if (
              columnName in record &&
              record[columnName] &&
              record[columnName].tasks.length > 0
            ) {
              return {
                children: (
                  <div className="flex flex-col justify-center gap-4">
                    <div className="w-full">
                      <ProgressComponent
                        done={record[columnName].devProgress?.done}
                        total={record[columnName].devProgress?.total}
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
        };
      }
    }
  );

  return (
    <>
      {data ? (
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
      )}
    </>
  );
};

export default SprintViewReportTabel;
