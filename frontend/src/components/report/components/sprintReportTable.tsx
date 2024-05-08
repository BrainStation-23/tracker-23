import { Avatar, Empty, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { ModifiesSprintReportUser, SprintReportTask } from "models/reports";

import { formatDate, getFormattedTime } from "@/services/timeActions";

import ProgressComponent from "./progressComponent";
import { ReportData } from "@/storage/redux/reportsSlice";
import EditReportConfigComponent from "./editReportConfigComponent";
import { useState } from "react";

const { Text } = Typography;
type Props = {
  data: ModifiesSprintReportUser[];
  reportData: ReportData;
};

const SprintReportTabel = ({ data, reportData }: Props) => {
  const [paginationState, setPaginationState] = useState({
    page: 1,
    pageSize: 10,
  });

  const columns: ColumnsType<ModifiesSprintReportUser> = [
    {
      key: "date",
      title: "Date",
      dataIndex: "date",
      render: (
        value: string,
        record: ModifiesSprintReportUser,
        index: number
      ) => {
        const trueIndex =
          index + paginationState.pageSize * (paginationState.page - 1);
        let calculatedRowSpan = record.dateColSpan;
        if (index >= 1 && value === data[trueIndex - 1].date) {
          calculatedRowSpan = 0;
        } else {
          for (
            let i = 0;
            trueIndex + i !== data.length && value === data[trueIndex + i].date;
            i += 1
          ) {
            calculatedRowSpan = i + 1;
          }
        }
        return {
          children: (
            <Text
              className="w-48 cursor-pointer font-semibold"
              ellipsis={{ tooltip: getFormattedTime(formatDate(value)) }}
            >
              {getFormattedTime(formatDate(value))}
            </Text>
          ),
          props: {
            rowSpan: calculatedRowSpan,
            style: record.dateCellStyle,
          },
        };
      },
      width: 200,
      align: "center",
    },
    {
      title: "Developer Name",
      dataIndex: "name",
      key: "name",
      render: (
        value: string,
        record: ModifiesSprintReportUser,
        index: number
      ) => {
        const trueIndex =
          index + paginationState.pageSize * (paginationState.page - 1);
        let calculatedRowSpan = record.userSpan;

        if (!(trueIndex % (paginationState.pageSize - 1))) {
          for (
            let i = 0;
            trueIndex + i !== data.length &&
            value === data[trueIndex + i].name &&
            record.date === data[trueIndex + i].date;
            i += 1
          ) {
            calculatedRowSpan = i + 1;
          }
        } else if (index >= 1 && value === data[trueIndex - 1].name) {
          calculatedRowSpan = 0;
        } else {
          for (
            let i = 0;
            trueIndex + i !== data.length &&
            value === data[trueIndex + i].name &&
            record.date === data[trueIndex + i].date;
            i += 1
          ) {
            calculatedRowSpan = i + 1;
          }
        }
        return {
          children: (
            <div className="mx-auto flex w-fit items-center justify-center gap-2 ">
              {record?.picture ? (
                <Avatar src={record.picture} alt="N" className="h-5 w-5" />
              ) : (
                <Avatar
                  alt="N"
                  className="h-5 w-5"
                  src="https://st3.depositphotos.com/15437752/19006/i/600/depositphotos_190061104-stock-photo-silhouette-male-gradient-background-white.jpg"
                />
              )}
              {record.name}
            </div>
          ),
          props: {
            rowSpan: calculatedRowSpan,
            style: record.style,
          },
        };
      },
      align: "center",
    },
    {
      title: "Sprint Assigned Task",
      dataIndex: "assignedTask",
      key: "assignedTask",
      render: (
        assignedTask: SprintReportTask,
        record: ModifiesSprintReportUser
      ) => {
        if (assignedTask)
          return {
            children: (
              <div>
                <Text
                  className="w-[200px] cursor-pointer"
                  ellipsis={{ tooltip: assignedTask?.title }}
                >
                  {assignedTask?.title}
                </Text>
              </div>
            ),
            props: {
              rowSpan: 1,
              style: record.style,
            },
          };
        else
          return {
            children: (
              <ProgressComponent
                done={record?.devProgress?.done}
                total={record?.devProgress?.total}
              />
            ),
            props: {
              rowSpan: 1,
              style: record.style,
            },
          };
      },
      align: "center",
    },
    {
      key: "yesterdayTask",
      title: "Yesterday Task",
      dataIndex: "yesterdayTasks",
      render: (task: SprintReportTask, record: ModifiesSprintReportUser) => {
        if (record.yesterdayTask)
          return {
            children: (
              <div>
                <Text
                  className="w-[200px] cursor-pointer"
                  ellipsis={{ tooltip: record?.yesterdayTask?.title }}
                >
                  {record?.yesterdayTask?.title}
                </Text>
              </div>
            ),
            props: {
              rowSpan: 1,
              style: record.style,
            },
          };
        else
          return {
            children: <></>,
            props: {
              rowSpan: 1,
              style: record.style,
            },
          };
      },
      align: "center",
    },
    {
      key: "todaysTask",
      title: "Today's Task",
      dataIndex: "todayTasks",
      render: (task: SprintReportTask, record: ModifiesSprintReportUser) => {
        if (record.todayTask)
          return {
            children: (
              <div>
                <Text
                  className="w-[200px] cursor-pointer"
                  ellipsis={{ tooltip: record?.todayTask?.title }}
                >
                  {record?.todayTask?.title}
                </Text>
              </div>
            ),
            props: {
              rowSpan: 1,
              style: record.style,
            },
          };
        else
          return {
            children: <></>,
            props: {
              rowSpan: 1,
              style: record.style,
            },
          };
      },
      align: "center",
    },
  ];

  return (
    <>
      {data?.length ? (
        <div className="flex flex-col gap-4">
          <Table
            bordered
            rowKey={"id"}
            columns={columns}
            dataSource={data}
            pagination={{
              pageSize: paginationState.pageSize,
              // showSizeChanger: false,
              // showLessItems: true,
              onChange: (page, pageSize) =>
                setPaginationState({ page, pageSize }),
              position: ["bottomRight", "bottomLeft"],
            }}
            scroll={{ y: 600 }}
          />
        </div>
      ) : (
        <Empty
          className="mt-12"
          description="Select Project And Sprint to View Data"
        >
          <EditReportConfigComponent reportData={reportData} />
        </Empty>
      )}
    </>
  );
};

export default SprintReportTabel;
