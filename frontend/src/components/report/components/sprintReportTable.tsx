import { Avatar, Empty, Table, Typography } from "antd";
import { ColumnsType } from "antd/es/table";
import { ModifiesSprintReportUser, SprintReportTask } from "models/reports";

import { formatDate, getFormattedTime } from "@/services/timeActions";

import ProgressComponent from "./progressComponent";

const { Text } = Typography;
type Props = {
  data: ModifiesSprintReportUser[];
};

const SprintReportTabel = ({ data }: Props) => {
  const columns: ColumnsType<ModifiesSprintReportUser> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (
        text: string,
        record: ModifiesSprintReportUser,
        index: number
      ) => ({
        children: (
          <Text
            className="w-[200px] cursor-pointer font-semibold"
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
      render: (
        text: string,
        record: ModifiesSprintReportUser,
        index: number
      ) => {
        return {
          children: (
            <div className="mx-auto flex w-fit items-center justify-center gap-2 ">
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
        record: ModifiesSprintReportUser,
        index: number
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
      render: (
        task: SprintReportTask,
        record: ModifiesSprintReportUser,
        index: number
      ) => {
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
      render: (
        task: SprintReportTask,
        record: ModifiesSprintReportUser,
        index: number
      ) => {
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
              current: 1,
              pageSize: 500,
              showSizeChanger: false,
              showLessItems: true,
              position: ["bottomRight", "bottomLeft"],
            }}
            scroll={{ y: 600 }}
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

export default SprintReportTabel;
