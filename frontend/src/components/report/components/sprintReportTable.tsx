import { formatDate, getFormattedTime } from "@/services/timeActions";
import { Avatar, Empty, Table, Typography } from "antd";
import ProgressComponent from "./progressComponent";

const { Text } = Typography;
const SprintReportTabel = ({ data }: any) => {
  const columns: any = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text: string, record: any, index: number) => ({
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
        },
      }),
      width: 200,
      align: "center",
    },
    {
      title: "Developer Name",
      dataIndex: "name",
      key: "name",
      render: (text: any, record: any, index: number) => {
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
          },
        };
      },
      align: "center",
    },
    {
      title: "Sprint Assigned Task",
      dataIndex: "assignedTask",
      key: "assignedTask",
      render: (assignedTask: any, record: any, index: number) => {
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
            props: { rowSpan: 1 },
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
            },
          };
      },
      align: "center",
    },
    {
      title: "Yesterday Task",
      dataIndex: "yesterdayTasks",
      key: "yesterdayTask",
      render: (task: any, record: any, index: number) => {
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
            },
          };
        else
          return {
            children: <></>,
            props: {
              rowSpan: 1,
            },
          };
      },
      align: "center",
    },
    {
      title: "Today's Task",
      dataIndex: "todayTasks",
      key: "todaysTask",
      render: (task: any, record: any, index: number) => {
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
            },
          };
        else
          return {
            children: <></>,
            props: {
              rowSpan: 1,
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
