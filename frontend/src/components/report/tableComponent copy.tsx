import { formatDecimalHours } from "@/services/timeActions";
import { Avatar, Table, TablePaginationConfig, Typography } from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { TableParams } from "models/tasks";
import { useState } from "react";

const { Text } = Typography;
type Props = {
  data: any;
  dateRange: any[];
};
const TableComponent = ({ data, dateRange }: Props) => {
  const columns: any = [
    {
      title: "User",
      dataIndex: "user",
      key: "user",
      render: (_: any, v: any) => (
        <div className="flex items-center gap-2">
          <div className=" ">
            {v?.picture ? (
              <Avatar src={v.picture} alt="N" className="h-[40px] w-[40px]" />
            ) : (
              <Avatar
                src={
                  "https://st3.depositphotos.com/15437752/19006/i/600/depositphotos_190061104-stock-photo-silhouette-male-gradient-background-white.jpg"
                }
                alt="N"
                className="h-[40px] w-[40px]"
              />
            )}
          </div>
          <Text
            className="w-[100px] cursor-pointer"
            ellipsis={{ tooltip: v.user }}
          >
            {v.user}
          </Text>
        </div>
      ),
    },
  ];
  dateRange.forEach((date) => {
    columns.push({
      title: date,
      dataIndex: date,
      key: date,
      align: "center",
      render: (_: any, v: any) => {
        return (
          <div className="w-full rounded px-2 text-center text-black">
            {v[date] ? formatDecimalHours(v[date]) : "-"}
          </div>
        );
      },
    });
  });
  columns.push({
    title: "Total",
    dataIndex: "totalHours",
    key: "totalHours",
    align: "center",
    render: (_: any, { totalHours }: any) => {
      return (
        <div className="w-full rounded px-2 text-center text-black">
          {totalHours ? formatDecimalHours(totalHours) : "-"}
        </div>
      );
    },
    sorter: (a: any, b: any) => {
      if (a.totalHours < b.totalHours) return -1;
      if (a.totalHours > b.totalHours) return 1;
      return 0;
    },
  });
  console.log(
    "🚀 ~ file: tableComponent copy.tsx:36 ~ TableComponent ~ columns:",
    columns
  );
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
      // onChange={onChange}
      rowKey={(d) => d.user}
      pagination={tableParams.pagination}
      // rowClassName={getRowClassName}
      onChange={handleTableChange}
      className="w-full"
    />
  );
};

export default TableComponent;
