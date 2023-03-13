import { Empty, Spin, Table, message, Input } from "antd";
import React, { useEffect, useState } from "react";
import {
  formatDate,
  getFormattedTotalTime,
  getTotalSpentTime,
} from "@/services/timeActions";

import type { TableProps } from "antd/es/table";
import { TaskDto } from "models/tasks";
import { getFormattedTime } from "../../services/timeActions";
import { userAPI } from "APIs";
import DateRangePicker from "../datePicker";
const { Search } = Input;
interface DataType {
  key: string;
  name: string;
  age: number;
  address: string;
  tags: string[];
}

const columns: any = [
  {
    title: "Title",
    dataIndex: "title",
    key: "title",

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
    title: "Description",
    dataIndex: "description",
    key: "description",
    align: "center",
  },
  {
    title: "Estimation",
    dataIndex: "estimation",
    key: "estimation",
    // defaultSortOrder: "descend",
    sorter: (a: any, b: any) => a.estimation - b.estimation,
    align: "center",
  },
  {
    title: "Started",
    dataIndex: "started",
    key: "started",
    align: "center",

    // defaultSortOrder: "descend",
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

    // defaultSortOrder: "descend",
    sorter: (a: any, b: any) => a.totalSpent - b.totalSpent,
    align: "center",
  },
  {
    title: "Priority",
    dataIndex: "priority",
    key: "priority",
    filters: [
      {
        text: "NORMAL",
        value: "NORMAL",
      },
      {
        text: "LOW",
        value: "LOW",
      },
      {
        text: "HIGH",
        value: "HIGH",
      },
    ],
    onFilter: (value: string, record: any) =>
      record.priority.indexOf(value) === 0,
    align: "center",
  },
  // {
  //   title: "Tags",
  //   key: "tags",
  //   dataIndex: "tags",
  //   render: (_, { tags }) => (
  //     <>
  //       {tags.map((tag) => {
  //         let color = tag.length > 5 ? "geekblue" : "green";
  //         if (tag === "loser") {
  //           color = "volcano";
  //         }
  //         return (
  //           <Tag color={color} key={tag}>
  //             {tag.toUpperCase()}
  //           </Tag>
  //         );
  //       })}
  //     </>
  //   ),
  // },
  // {
  //   title: "Action",
  //   key: "action",
  //   render: (_, record) => (
  //     <Space size="middle">
  //       <a>Invite {record.name}</a>
  //       <a>Delete</a>
  //     </Space>
  //   ),
  // },
];

const ExportPageComponent = () => {
  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [loading, setLoading] = useState(false);
  const getTasks = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getTasks();
      const tmpTasks = res.map((task: TaskDto) => {
        const started = task.sessions[0]
          ? getFormattedTime(formatDate(task.sessions[0].startTime))
          : "Not Started";
        const ended = task.sessions[task.sessions.length - 1]?.endTime
          ? getFormattedTime(
              formatDate(task.sessions[task.sessions.length - 1].endTime)
            )
          : task.sessions[0]
          ? "Running"
          : "Not Started";
        const total = getFormattedTotalTime(getTotalSpentTime(task.sessions));
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          estimation: task.estimation,
          startTime: formatDate(task.sessions[0]?.startTime),
          endTime: formatDate(task.sessions[task.sessions.length - 1]?.endTime),
          started: started,
          ended: ended,
          total: total + "  s",
          totalSpent: getTotalSpentTime(task.sessions),
          priority: task.priority,
        };
      });
      setTasks(tmpTasks || []);
    } catch (error) {
      message.error("Error getting tasks");
    } finally {
      setLoading(false);
    }
  };

  const onChange: TableProps<any>["onChange"] = (
    pagination,
    filters,
    sorter,
    extra
  ) => {
    console.log("params", pagination, filters, sorter, extra);
  };

  useEffect(() => {
    if (tasks?.length <= 0) getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log("🚀 ~ file: index.tsx:106 ~ useEffect ~ tasks:", tasks);
  return (
    <>
      <Spin spinning={loading}>
        {tasks.length ? (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-2">
                <DateRangePicker />{" "}
              </div>
              <div className="col-span-2">
                <Search
                  placeholder="input search loading with enterButton"
                  loading
                  enterButton
                  onChange={(e) => console.log(e.target.value)}
                  onPressEnter={(e) => {
                    console.log(e);
                  }}
                />
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={tasks}
              onChange={onChange}
              rowKey={"id"}
              pagination={{ position: ["bottomCenter"] }}
            />
          </div>
        ) : (
          <Empty description="No tasks" />
        )}
      </Spin>
    </>
  );
};
export default ExportPageComponent;
