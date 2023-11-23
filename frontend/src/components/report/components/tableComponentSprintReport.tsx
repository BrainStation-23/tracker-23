import FormatTimeForSettings from "@/components/common/time/formatTimeForSettings";
import { Table, TablePaginationConfig, Typography } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { SprintData } from "models/reports";
import { TableParams } from "models/tasks";
import { useState } from "react";

const { Text } = Typography;
type Props = {
  data: any;
  column: any[];
  dateRangeArray?: any;
};
const TableComponentSprintReport = ({ data, column }: Props) => {
  const columns: any = [
    {
      title: "Sprint",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      render: (_: any, v: any) => (
        <div>
          <Text
            className="w-[100px] cursor-pointer"
            ellipsis={{ tooltip: v.name }}
          >
            {v.name}
          </Text>
        </div>
      ),
    },
  ];
  column.forEach((user) => {
    columns.push({
      title: (
        <div className="mx-auto flex w-max items-center justify-center gap-2 ">
          {user}
        </div>
      ),
      dataIndex: user,
      key: user,
      align: "center",
      // width: 100,
      render: (_: any, sprintData: SprintData) => {
        return (
          <div className="w-full cursor-pointer rounded px-2 text-center  text-black">
            <FormatTimeForSettings time={sprintData[user].estimation} />
            {" / "}
            <FormatTimeForSettings time={sprintData[user].timeSpent} />
          </div>
        );
      },
    });
  });
  // columns.push({
  //     title: "Total",
  //     dataIndex: "totalTime",
  //     key: "totalTime",
  //     align: "center",
  //     fixed: "right",
  //     render: (_: any, { totalTime }: any) => {
  //         return (
  //             <div className="w-full rounded px-2 text-center text-black">
  //                 <FormatTimeForSettings time={totalTime} />
  //             </div>
  //         );
  //     },
  //     sorter: (a: any, b: any) => {
  //         if (a.totalTime < b.totalTime) return -1;
  //         if (a.totalTime > b.totalTime) return 1;
  //         return 0;
  //     },
  // });
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showLessItems: true,
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
      columns={columns}
      dataSource={data}
      rowKey={(d) => d.user}
      pagination={tableParams.pagination}
      onChange={handleTableChange}
      className="w-full"
    />
  );
};

export default TableComponentSprintReport;
