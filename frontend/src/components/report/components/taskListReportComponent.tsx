import { Empty, Table, Typography } from "antd";
import { TaskDto } from "models/tasks";
import { statusBGColorEnum, statusBorderColorEnum } from "utils/constants";

import TablePriorityComponent from "@/components/common/tableComponents/tablePriorityComponent";
import FormatTimeForSettings from "@/components/common/time/formatTimeForSettings";
import { integrationIcons } from "@/components/integrations/components/importCard";
import TimeDisplayComponent from "@/components/tasks/timeDisplayComponent";
import { checkIfRunningTask, startTimeSorter } from "@/services/taskActions";
import {
  formatDate,
  getFormattedTime,
  getTotalSpentTime,
} from "@/services/timeActions";
import { ReportData } from "@/storage/redux/reportsSlice";
import EditReportConfigComponent from "./editReportConfigComponent";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";

const { Text } = Typography;
const TaskListReportComponent = ({
  tasks,
  reportData,
}: {
  tasks: any[];
  reportData: ReportData;
}) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const totalEstimation = tasks.reduce((acc, curr) => acc + curr.estimation, 0);
  const totalSpent =
    tasks.reduce((acc, curr) => acc + curr.totalSpent, 0) / 1000;
  let tmp = totalSpent;
  const hours = Math.floor(tmp / 3600);
  tmp %= 3600;
  const minutes = Math.round(tmp / 60);

  const columns: any = [
    {
      key: "title",
      fixed: isMobile ? "false" : "left",
      title: "Title",
      dataIndex: "title",
      width: isMobile ? 100 : 256,
      render: (_: any, { title }: TaskDto) => (
        <div className="text-left">
          <Text
            className="w-32 font-semibold lg:w-64"
            ellipsis={{
              tooltip: title,
            }}
          >
            {title ? title : "---"}
          </Text>
        </div>
      ),
      sorter: (a: any, b: any) => {
        if (a.title === b.title) {
          return 0;
        }
        if (a.title > b.title) {
          return 1;
        }
        return -1;
      },
    },
    {
      title: "Project / Calendar",
      dataIndex: "projectName",
      key: "projectName",
      width: isMobile ? 100 : 200,
      render: (_: any, { projectName }: TaskDto) => (
        <div className="mx-auto">{projectName ? projectName : "---"}</div>
      ),
      align: "center",
    },
    {
      title: "Source",
      dataIndex: "dataSource",
      key: "dataSource",
      align: "center",
      width: isMobile ? 100 : 200,
      render: (dataSource: any, task: TaskDto) => (
        <div className="flex max-w-[150px] items-center justify-center gap-2 ">
          <div>{integrationIcons[task.source]} </div>
          <Text
            className="w-min cursor-pointer"
            ellipsis={{ tooltip: dataSource }}
          >
            {dataSource &&
              (task.source === "TRACKER23" ? (
                <>{task.source}</>
              ) : (
                <Link target="_blank" href={task?.url ?? dataSource}>
                  <Text ellipsis={{ tooltip: task?.url ?? dataSource }}>
                    {task.source}
                  </Text>
                </Link>
              ))}
          </Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      width: isMobile ? 100 : 200,
      render: (_: any, task: TaskDto) => (
        <div className="flex justify-center">
          <div
            style={{
              backgroundColor: statusBGColorEnum[task.statusCategoryName],
              border: `1px solid ${
                statusBorderColorEnum[task.statusCategoryName]
              }`,
              borderRadius: "36px",
            }}
            className="relative flex w-max items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: statusBorderColorEnum[task.statusCategoryName],
              }}
            />

            <div>{task.status}</div>
          </div>
        </div>
      ),
    },

    {
      key: "priority",
      align: "center",
      title: "Priority",
      dataIndex: "priority",
      width: isMobile ? 120 : 200,
      render: (_: any, task: TaskDto) => <TablePriorityComponent task={task} />,
    },
    {
      key: "started",
      title: "Started",
      dataIndex: "started",
      width: isMobile ? 120 : 200,
      render: (_: any, task: TaskDto) => (
        <>
          {task.sessions?.length > 0
            ? getFormattedTime(formatDate(task.sessions[0].startTime))
            : "Not Started"}
        </>
      ),
      align: "center",
      sorter: (a: TaskDto, b: TaskDto) => {
        return startTimeSorter(a, b);
      },
    },
    {
      title: "Ended",
      dataIndex: "ended",
      key: "ended",
      width: isMobile ? 120 : 200,
      render: (_: any, task: TaskDto) => (
        <>
          {task.sessions?.length > 0 && !checkIfRunningTask(task.sessions)
            ? getFormattedTime(
                formatDate(task.sessions[task.sessions?.length - 1]?.endTime)
              )
            : task.sessions[0]
            ? "Running"
            : "Not Started"}
        </>
      ),
      align: "center",
    },
    {
      title: `Estimation (${totalEstimation} H)`,
      dataIndex: "estimation",
      key: "estimation",
      width: isMobile ? 80 : 200,
      render: (_: any, { estimation }: TaskDto) => (
        <FormatTimeForSettings time={estimation} />
      ),
      sorter: (a: any, b: any) => a.estimation - b.estimation,
      align: "center",
    },
    {
      title: `Total Spent (${hours}H ${minutes}M)`,
      dataIndex: "total",
      key: "total",
      width: isMobile ? 140 : 220,
      render: (_: any, task: any) => (
        <TimeDisplayComponent totalTime={getTotalSpentTime(task.sessions)} />
      ),
      sorter: (a: any, b: any) => a.totalSpent - b.totalSpent,
      align: "center",
    },
  ];
  return (
    <div className="flex w-full flex-col justify-center gap-4">
      {tasks.length ? (
        <Table
          rowKey={"id"}
          columns={columns}
          dataSource={tasks}
          scroll={{ x: "max-content" }}
          pagination={{ position: ["bottomCenter"] }}
        />
      ) : (
        <Empty className="mt-12" description="No tasks">
          <EditReportConfigComponent reportData={reportData} />
        </Empty>
      )}
    </div>
  );
};

export default TaskListReportComponent;
