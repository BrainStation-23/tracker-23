import { formatDecimalHours } from "@/services/timeActions";
import {
  Avatar,
  Table,
  TablePaginationConfig,
  Tooltip,
  Typography,
} from "antd";
import { FilterValue, SorterResult } from "antd/es/table/interface";
import { TableParams } from "models/tasks";
import { useState } from "react";
import { LuHelpCircle } from "react-icons/lu";
import { RootState } from "@/storage/redux/store";
import { useAppSelector } from "@/storage/redux";

const { Text } = Typography;
type Props = {
  data: any;
  column: any[];
  dateRangeArray: any;
};
const TableComponent = ({ data, column, dateRangeArray }: Props) => {
  const timeFormat = useAppSelector(
    (state: RootState) => state.settingsSlice.timeFormat
  );

  const columns: any = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      fixed: "left",
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
            ellipsis={{ tooltip: v.name }}
          >
            {v.name}
          </Text>
        </div>
      ),
    },
  ];
  column.forEach((date) => {
    columns.push({
      title: (
        <div className="mx-auto flex w-max items-center justify-center gap-2 ">
          {date}
          {dateRangeArray && (
            <Tooltip
              className={dateRangeArray ? "cursor-auto" : ""}
              title={dateRangeArray ? dateRangeArray[date] : null}
            >
              <LuHelpCircle />
            </Tooltip>
          )}
        </div>
      ),
      dataIndex: date,
      key: date,
      align: "center",
      // width: 100,
      render: (_: any, v: any) => {
        return (
          <div className="w-full cursor-pointer rounded px-2 text-center  text-black">
            {v[date]
              ? timeFormat === "Day"
                ? formatDecimalHours(v[date])
                : v[date] + "h"
              : "-"}
          </div>
        );
      },
    });
  });
  columns.push({
    title: "Total",
    dataIndex: "totalTime",
    key: "totalTime",
    align: "center",
    fixed: "right",
    render: (_: any, { totalTime }: any) => {
      return (
        <div className="w-full rounded px-2 text-center text-black">
          {totalTime
            ? timeFormat === "Day"
              ? formatDecimalHours(totalTime)
              : totalTime + "h"
            : "-"}
        </div>
      );
    },
    sorter: (a: any, b: any) => {
      if (a.totalTime < b.totalTime) return -1;
      if (a.totalTime > b.totalTime) return 1;
      return 0;
    },
  });
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
