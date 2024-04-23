import {
  Empty,
  Table,
  Avatar,
  Tooltip,
  Typography,
  TablePaginationConfig,
} from "antd";
import { useState } from "react";
import { TableParams } from "models/tasks";
import { LuHelpCircle } from "react-icons/lu";
import { useMediaQuery } from "react-responsive";
import { FilterValue, SorterResult } from "antd/es/table/interface";

import { ReportData } from "@/storage/redux/reportsSlice";
import EditReportConfigComponent from "./editReportConfigComponent";
import FormatTimeForSettings from "@/components/common/time/formatTimeForSettings";

const { Text } = Typography;
type Props = {
  data: any;
  column: any[];
  dateRangeArray: any;
  reportData: ReportData;
};
const TableComponent = ({
  data,
  column,
  reportData,
  dateRangeArray,
}: Props) => {
  const isMobile = useMediaQuery({ maxWidth: 767 });

  const columns: any = [
    {
      key: "name",
      fixed: "left",
      title: "User",
      dataIndex: "name",
      width: isMobile ? 50 : 200,
      render: (_: any, v: any, idx: number) => (
        <div className="flex items-center gap-2" key={idx}>
          <div>
            {v?.picture ? (
              <Avatar src={v.picture} alt="N" className="h-10 w-10" />
            ) : (
              <Avatar
                alt="N"
                className="h-10 w-10"
                src="https://st3.depositphotos.com/15437752/19006/i/600/depositphotos_190061104-stock-photo-silhouette-male-gradient-background-white.jpg"
              />
            )}
          </div>
          <Text className="cursor-pointer" ellipsis={{ tooltip: v?.name }}>
            {v?.name}
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
      key: date,
      dataIndex: date,
      align: "center",
      width: isMobile ? 50 : 150,
      render: (_: any, v: any) => (
        <div className="w-full cursor-pointer rounded px-2 text-center text-black">
          <FormatTimeForSettings time={v[date]} />
        </div>
      ),
    });
  });

  columns.push({
    width: isMobile ? 50 : 100,
    title: "Total",
    align: "center",
    key: "totalTime",
    dataIndex: "totalTime",
    fixed: isMobile ? "" : "right",
    render: (_: any, { totalTime }: any) => (
      <div className="w-full rounded px-2 text-center text-black">
        <FormatTimeForSettings time={totalTime} />
      </div>
    ),
    sorter: (a: any, b: any) => {
      if (a.totalTime < b.totalTime) return -1;
      if (a.totalTime > b.totalTime) return 1;
      return 0;
    },
  });

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

  return columns?.length > 0 && data?.length > 0 ? (
    <div className="flex flex-col gap-4">
      <Table
        bordered
        columns={columns}
        dataSource={data}
        className="w-full"
        scroll={{ x: 1500 }}
        rowKey={(d) => d.user}
        onChange={handleTableChange}
        pagination={tableParams.pagination}
      />
    </div>
  ) : (
    <div>
      <Empty className="mt-12" description="No Data">
        <EditReportConfigComponent reportData={reportData} />
      </Empty>
    </div>
  );
};

export default TableComponent;
