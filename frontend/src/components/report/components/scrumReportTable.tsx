import { Empty, Table, Typography } from "antd";
import EditReportConfigComponent from "./editReportConfigComponent";
import { ModifiesScrumReport, ScrumReportTask } from "models/reports";
import { ColumnsType } from "antd/es/table";
const { Text } = Typography;

type Props = {
  date: string | Date;
  data: any;
  reportData: any;
};

const ScrumReportTable = ({ date, data, reportData }: Props) => {
  const formattedDate = new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const columns: ColumnsType<ModifiesScrumReport> = [
    {
      title: `${formattedDate}`,
      dataIndex: "name",
      key: "name",
      render: (
        value: string,
        record: ModifiesScrumReport,
        index: number
      ) => {
        return {
          children: (
            <div className="mx-auto flex w-fit items-center justify-center gap-2 ">
              {record.name} <br/>
              Est. Today:{" " + record.estimationHours} <br/>
              Spent Last:{" " + record.spentHours}
            </div>
          ),
          props: {
            rowSpan: index === 0 && record.userGroupRowIndex > 0
              ? record.userGroupRows - record.userGroupRowIndex
              : record.userSpan,
            style: record.style,
          },
        };
      },
      align: "left",
    },
    {
      title: " ",
      dataIndex: "assignedTask",
      key: "assignedTask",
      render: (
        assignedTask: ScrumReportTask,
        record: ModifiesScrumReport
      ) => {
        if (assignedTask)
          return {
            children: (
              <div>
                <Text
                  className="w-[100px] cursor-pointer"
                  ellipsis={{ tooltip: assignedTask?.key }}
                >
                  {assignedTask?.key}
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
      title: "Plan for this week",
      dataIndex: "assignedTask",
      key: "assignedTask",
      render: (
        assignedTask: ScrumReportTask,
        record: ModifiesScrumReport
      ) => {
        if (assignedTask)
          return {
            children: (
              <div>
                <Text
                  className="w-[250px] cursor-pointer"
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
      key: "What I'll do today",
      title: "What I'll do today",
      dataIndex: "todayTasks",
      render: (task: ScrumReportTask, record: ModifiesScrumReport) => {
        if (record.todayTask)
          return {
            children: (
              <div>
                <Text
                  className=" w-[250] cursor-pointer"
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
    {
      key: "todayTaskEstimation",
      title: "Est. Hours",
      dataIndex: "todayTasks",
      render: (task: ScrumReportTask, record: ModifiesScrumReport) => {
        if (record.todayTask)
          return {
            children: (
              <div>
                <Text
                  className="w-[100px] cursor-pointer"
                  ellipsis={{ tooltip: record?.todayTask?.estimation }}
                >
                  {record?.todayTask?.estimation}
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
      key: "yesterdayTask",
      title: "What I did yesterday",
      dataIndex: "yesterdayTasks",
      render: (task: ScrumReportTask, record: ModifiesScrumReport) => {
        if (record.yesterdayTask)
          return {
            children: (
              <div>
                <Text
                  className="w-[250px] cursor-pointer"
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
      key: "spentHours",
      title: "Spent Hours",
      dataIndex: "yesterdayTasks",
      render: (task: ScrumReportTask, record: ModifiesScrumReport) => {
        if (record.yesterdayTask)
          return {
            children: (
              <div>
                <Text
                  className="w-[100px] cursor-pointer"
                  ellipsis={{ tooltip: record?.yesterdayTask?.spentHours }}
                >
                  {record?.yesterdayTask?.spentHours}
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
      key: "blockers",
      title: "Blocker (if any)",
      dataIndex: "assignedTask",
      render: (task: ScrumReportTask, record: ModifiesScrumReport) => {
        if (record.assignedTask)
          return {
            children: (
              <div>
                <Text
                  className="w-[200px] cursor-pointer"
                  ellipsis={{ tooltip: record?.assignedTask?.title }}
                >
                  {record?.assignedTask?.description}
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
            rowKey={"rowKey"}
            columns={columns}
            dataSource={data}
            pagination={{
              showSizeChanger: true,
              position: ["bottomRight", "bottomLeft"],
            }}
            scroll={{x: "max-content" }}
          />
        </div>
      )
      : (
        <Empty className="mt-12" description="Select Project to View Data">
          <EditReportConfigComponent reportData={reportData} />
        </Empty>
      )}
    </>
  );
};

export default ScrumReportTable;
