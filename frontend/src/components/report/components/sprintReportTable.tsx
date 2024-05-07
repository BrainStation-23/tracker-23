import { Avatar, Empty, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { ModifiesSprintReportUser, SprintReportTask } from "models/reports";

import { formatDate, getFormattedTime } from "@/services/timeActions";

import ProgressComponent from "./progressComponent";
import { ReportData } from "@/storage/redux/reportsSlice";
import EditReportConfigComponent from "./editReportConfigComponent";

const { Text } = Typography;
type Props = {
  data: ModifiesSprintReportUser[];
  reportData: ReportData;
};

const SprintReportTabel = ({ data, reportData }: Props) => {
  const columns: ColumnsType<ModifiesSprintReportUser> = [
    {
      key: "date",
      title: "Date",
      dataIndex: "date",
      render: (text: string, record: ModifiesSprintReportUser) => ({
        children: (
          <Text
            className="w-48 cursor-pointer font-semibold"
            ellipsis={{ tooltip: getFormattedTime(formatDate(text)) }}
          >
            {getFormattedTime(formatDate(text))}
          </Text>
        ),
        props: {
          rowSpan: record.dateColSpan,
          style: record.dateCellStyle,
        },
      }),
      width: 200,
      align: "center",
    },
    {
      title: "Developer Name",
      dataIndex: "name",
      key: "name",
      render: (_: string, record: ModifiesSprintReportUser) => {
        return {
          children: (
            <div className="mx-auto flex w-fit items-center justify-center gap-2 ">
              {record?.picture ? (
                <Avatar src={record.picture} alt="N" className="h-5 w-5" />
              ) : (
                <Avatar
                  src={
                    "https://st3.depositphotos.com/15437752/19006/i/600/depositphotos_190061104-stock-photo-silhouette-male-gradient-background-white.jpg"
                  }
                  alt="N"
                  className="h-5 w-5"
                />
              )}
              {record.name}
            </div>
          ),
          props: {
            rowSpan: record.userSpan,
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
      title: "Yesterday Task",
      dataIndex: "yesterdayTasks",
      key: "yesterdayTask",
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
      title: "Today's Task",
      dataIndex: "todayTasks",
      key: "todaysTask",
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
            columns={columns}
            dataSource={data}
            rowKey={"id"}
            bordered
            pagination={{
              // pageSize: 100,
              // showSizeChanger: false,
              // showLessItems: true,
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
