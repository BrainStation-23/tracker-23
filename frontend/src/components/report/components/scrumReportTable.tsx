import { Empty, Table, Typography } from "antd";
import { Key, ReactNode } from "react";
import EditReportConfigComponent from "./editReportConfigComponent";

const { Text } = Typography;

type Task = {
  key: ReactNode;
  id: Key;
  title: string;
  estimation: number;
  spentHours: number;
  description: string;
  projectName: string;
};

type User = {
  id: Key;
  firstName: string;
  lastName: string;
};

type DataItem = {
  user: User;
  tasks: Task[];
};

type Props = {
  data: { date: string; resData: DataItem[] };
  reportData: any;
};

const ScrumReportTable = ({ data, reportData }: Props) => {
  const date = new Date(data?.date);
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const formattedDate = date.toLocaleString("en-US", options);

  const columns = [
    {
      key: "name",
      title: `${formattedDate}`,
      dataIndex: "user",
      render: (user: User) => (
        <Text>
          {user?.firstName} {user?.lastName}
        </Text>
      ),
      width: 200,
      align: "center" as "center",
    },
    {
      key: "ticket",
      title: " ",
      dataIndex: "tasks",
      render: (tasks: Task[]) => (
        <ul>
          {tasks?.map((task) => (
            <li key={task.id}>
              <Text>{task?.key}</Text>
            </li>
          ))}
        </ul>
      ),
      width: 100,
      align: "left" as "left",
    },
    {
      key: "weekPlan",
      title: "Plan for this week",
      dataIndex: "tasks",
      render: (tasks: Task[]) => (
        <ul>
          {tasks?.map((task) => (
            <li key={task.id}>
              <Text>{task?.title}</Text>
            </li>
          ))}
        </ul>
      ),
      width: 400,
      align: "left" as "left",
    },
    {
      key: "today_task",
      title: "What will do today",
      dataIndex: "todayTasks",
      render: (tasks: Task[]) => (
        <ul>
          {tasks?.map((task) => (
            <li key={task.id}>
              <Text>{task?.title}</Text>
            </li>
          ))}
        </ul>
      ),
      width: 400,
      align: "left" as "left",
    },
    {
      key: "est_hours",
      title: "Est. Hours",
      dataIndex: "tasks",
      render: (tasks: Task[]) => (
        <ul>
          {tasks?.map((task) => (
            <li key={task.id}>
              <Text>{task?.estimation}</Text>
            </li>
          ))}
        </ul>
      ),
      width: 50,
      align: "left" as "left",
    },
    {
      key: "yesterday_task",
      title: "What did yesterday",
      dataIndex: "yesterdayTasks",
      render: (tasks: Task[]) => (
        <ul>
          {tasks?.map((task) => (
            <li key={task.id}>
              <Text>{task?.title}</Text>
            </li>
          ))}
        </ul>
      ),
      width: 400,
      align: "left" as "left",
    },
    {
      key: "spent_hours",
      title: "Spent Hours",
      dataIndex: "tasks",
      render: (tasks: Task[]) => (
        <ul>
         {tasks?.map((task, index) => (
        <li
          key={task.id}
          style={{
            padding: "0"
          }}
        >
          <Text>{task?.spentHours}</Text>
        </li>
      ))}
        </ul>
      ),
      width: 150,
      align: "left" as "left",
    },
    {
      key: "blocker",
      title: "Blocker",
      dataIndex: "tasks",
      render: (tasks: Task[]) => (
        <ul>
          {tasks?.map((task) => (
            <li key={task.id}>
              <Text>{task?.description}</Text>
            </li>
          ))}
        </ul>
      ),
      width: 400,
      align: 'left' as "left",
    },
  ];

  return (
    <>
      {data?.resData?.length > 0 ? (
        <Table
          bordered
          rowKey={(record) => record.user?.id}
          columns={columns}
          dataSource={data.resData}
          rowClassName={(record, index) =>
            index % 2 === 0 ? "bg-[#6BA9FF]" : "bg-[#3498DB]"
          }
          onRow={(record, rowIndex) => ({
            onMouseEnter: (event) => {
              event.currentTarget.style.backgroundColor = "#ADD8E6"; // Change the background color on hover
            },
            onMouseLeave: (event) => {
              event.currentTarget.style.backgroundColor =
                rowIndex % 2 === 0 ? "#6BA9FF" : "#3498DB"; // Restore the original background color
            },
          })}
          pagination={{
            showSizeChanger: true,
            position: ["bottomRight", "bottomLeft"],
          }}
          scroll={{ x: "max-content" }}
        />
      ) : (
        <Empty
          className="mt-12"
          description="Select Project to View Data"
        >
          <EditReportConfigComponent reportData={reportData} />
        </Empty>
      )}
    </>
  );
};

export default ScrumReportTable;
