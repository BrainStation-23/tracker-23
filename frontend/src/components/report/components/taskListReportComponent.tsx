import { Empty, Table, Typography } from "antd";
import { TaskDto } from "models/tasks";
import { statusBGColorEnum, statusBorderColorEnum } from "utils/constants";

import TablePriorityComponent from "@/components/common/tableComponents/tablePriorityComponent";
import FormatTimeForSettings from "@/components/common/time/formatTimeForSettings";
import TimeDisplayComponent from "@/components/tasks/components/timeDisplayComponent";
import { getTotalSpentTime } from "@/services/timeActions";

const { Text } = Typography;
const TaskListReportComponent = ({ tasks }: any) => {
  const columns: any = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      render: (_: any, { title }: TaskDto) => (
        <div className="w-min text-left">
          <Text
            className=" mx-auto w-[220px] font-semibold"
            ellipsis={{
              tooltip: title,
            }}
          >
            {title ? title : "---"}
          </Text>
        </div>
      ),
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) => {
        if (a.title === b.title) {
          return 0;
        }
        if (a.title > b.title) {
          return 1;
        }
        return -1;
      },
      align: "center",
      // render: (text) => <a>{text}</a>,
    },
    {
      title: "Project Name",
      dataIndex: "projectName",
      key: "projectName",
      render: (_: any, { projectName }: TaskDto) => (
        <div className="m-max mx-auto max-w-[200px] ">
          {projectName ? projectName : "---"}
        </div>
      ),
      align: "center",
      // render: (text) => <a>{text}</a>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
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
      title: "Estimation",
      dataIndex: "estimation",
      key: "estimation",
      // defaultSortOrder: "descend",
      render: (_: any, { estimation }: TaskDto) => (
        <FormatTimeForSettings time={estimation} />
      ),
      sorter: (a: any, b: any) => a.estimation - b.estimation,
      align: "center",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (_: any, task: TaskDto) => <TablePriorityComponent task={task} />,
      align: "center",
    },
    {
      title: "Started",
      dataIndex: "started",
      key: "started",
      align: "center",
      sorter: (a: any, b: any) => {
        if (a.startTime !== null && b.startTime !== null)
          return a.startTime - b.startTime;
        else if (b.startTime === null && a.startTime === null) return true;
        else if (a.startTime === null) return false;
        else return false;
      },
    },
    {
      title: "Ended",
      dataIndex: "ended",
      key: "ended",
      align: "center",
    },

    {
      title: "Total Spent",
      dataIndex: "total",
      key: "total",
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
          columns={columns}
          dataSource={tasks}
          // onChange={onChange}
          rowKey={"id"}
          pagination={{ position: ["bottomCenter"] }}
        />
      ) : (
        <Empty className="mt-12" description="No tasks" />
      )}
    </div>
  );
};

export default TaskListReportComponent;
