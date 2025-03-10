import { Avatar, Table, TablePaginationConfig, Typography } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { SprintUser } from "models/reports";
import { TableParams } from "models/tasks";
import { useState } from "react";
import { GiSprint } from "react-icons/gi";
import { LuTimer, LuTimerReset } from "react-icons/lu";

import FormatTimeForSettings from "@/components/common/time/formatTimeForSettings";
import { useMediaQuery } from "react-responsive";

const { Text } = Typography;
type Props = {
  data: any;
  column: SprintUser[];
  dateRangeArray?: any;
};
const TableComponentSprintReport = ({ data, column }: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const columns: any = [
    {
      title: (
        <div className="flex items-center gap-2">
          <GiSprint size={24} />
          Sprint
        </div>
      ),
      key: "name",
      fixed: "left",
      dataIndex: "name",
      width: isMobile ? 96 : 112,
      render: (_: any, v: any) => (
        <Text
          ellipsis={{ tooltip: v.name }}
          className="w-24 cursor-pointer md:w-28"
        >
          {v.name}
        </Text>
      ),
    },
  ];
  column?.forEach((user) => {
    columns.push({
      title: (
        <div className="mx-auto flex w-fit items-center justify-center gap-2 ">
          {user?.picture ? (
            <Avatar src={user.picture} alt="N" className="h-5 w-5" />
          ) : (
            <Avatar
              src={
                "https://st3.depositphotos.com/15437752/19006/i/600/depositphotos_190061104-stock-photo-silhouette-male-gradient-background-white.jpg"
              }
              alt="N"
              className="h-5 w-5"
            />
          )}
          {user.name}
        </div>
      ),
      width: "500px",
      children: [
        {
          title: (
            <div className="flex items-center justify-center gap-2">
              <LuTimerReset />
              Estimation
            </div>
          ),
          key: user.userId,
          align: "center",
          width: "140px",
          dataIndex: user.userId,
          render: (_: any, sprintData: any) => {
            return (
              <div className="m-auto w-fit cursor-pointer rounded px-2  text-center text-black">
                <FormatTimeForSettings
                  time={sprintData[user.userId].estimation}
                />
              </div>
            );
          },
        },
        {
          title: (
            <div className="flex items-center justify-center gap-2">
              <LuTimer />
              Spent Time
            </div>
          ),
          key: user.userId,
          align: "center",
          width: "140px",
          dataIndex: user.userId,
          render: (_: any, sprintData: any) => {
            return (
              <div className="m-auto w-max min-w-[80px] cursor-pointer rounded px-2  text-center text-black">
                <FormatTimeForSettings
                  time={sprintData[user.userId].timeSpent}
                />
              </div>
            );
          },
        },
      ],
      align: "center",
    });
  });
  // if (column.length < 6)
  //   columns.push({
  //     title: "-",
  //     dataIndex: "totalTime",
  //     key: "totalTime",
  //     align: "center",
  //     render: () => (
  //       <div className="w-full rounded px-2 text-center text-black">-</div>
  //     ),
  //   });
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      // current: 1,
      // pageSize: 10,
      // showSizeChanger: true,
      // showLessItems: true,
      position: ["bottomRight", "bottomLeft"],
    },
  });

  const handleTableChange = (
    pagination: TablePaginationConfig,
    filters: Record<string, FilterValue>,
    sorter: SorterResult<any> | SorterResult<any>[]
  ) => {
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
  };

  return (
    <Table
      bordered
      columns={columns}
      dataSource={data}
      className="w-full"
      rowKey={(d) => d.sprintId}
      onChange={handleTableChange}
      scroll={{ x: "max-content" }}
      pagination={tableParams.pagination}
    />
  );
};

export default TableComponentSprintReport;
