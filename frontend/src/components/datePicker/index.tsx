import { DatePicker, Dropdown, MenuProps, Space } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import {
  CalendarOutlined,
  DownOutlined,
  UserOutlined,
} from "@ant-design/icons";
import DownArrowIconSvg from "@/assets/svg/DownArrowIconSvg";
const { RangePicker } = DatePicker;
const DateRangePicker = ({ setSelectedDate }: any) => {
  const today = dayjs();
  const month = dayjs().month(2);
  const dayOfTheWeek = dayjs().day();
  const thisWeek = {
    start: today.subtract(dayOfTheWeek - 1, "day"),
    end: today.add(7 - dayOfTheWeek, "day"),
  };
  // console.log([today, thisWeek, month]);

  const [dates, setDates] = useState<any>([today.subtract(7, "day"), today]);
  const [value, setValue] = useState<any>(null);
  const [dropdownText, setDropdownText] = useState<any>(
    getDateRangeArray("this-week")
  );
  // console.log(
  //   "🚀 ~ file: index.tsx:23 ~ DateRangePicker ~ dropdownText:",
  //   dropdownText
  // );
  // console.log(
  //   "🚀 ~ file: index.tsx:9 ~ DateRangePicker ~ dayjs().date():",
  //   today
  // );
  // console.log("🚀 ~ file: index.tsx:6 ~ DateRangePicker ~ dates:", dates);
  // console.log("🚀 ~ file: index.tsx:7 ~ DateRangePicker ~ value:", value);
  const items: MenuProps["items"] = [];
  const tmp = Object.entries(dateRangeOptions);
  tmp.forEach((val) => {
    items.push({
      label: val[1],
      key: val[0],
      icon: <CalendarOutlined />,
    });
  });
  const menuProps = {
    items,
    onClick: (val: any) => {
      console.log(val);
      setDropdownText(getDateRangeArray(val.key));
      setSelectedDate(getDateRangeArray(val.key));
    },
  };

  const getFormatedDate = (ar: any) => {};

  return (
    <>
      <div className="w-72">
        <Dropdown
          menu={menuProps}
          trigger={["click"]}
          className="flex w-[300px] items-center rounded bg-gray-50 p-2 hover:bg-gray-100"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarOutlined />
              <div>
                {dropdownText && (
                  <>
                    {dropdownText[0]} - {dropdownText[1]}
                  </>
                )}
              </div>
            </div>
            <DownArrowIconSvg />
            {/* <DownOutlined /> */}
          </div>
        </Dropdown>
      </div>
    </>
  );
};

export default DateRangePicker;

export const getDateRangeArray = (key: string) => {
  let startDate, endDate;

  switch (key) {
    case "all":
      return null;
    case "today":
      startDate = localFormat(dayjs());
      endDate = localFormat(dayjs());
      break;
    case "yesterday":
      startDate = localFormat(dayjs().subtract(1, "day"));
      endDate = localFormat(dayjs().subtract(1, "day"));
      break;
    case "tomorrow":
      startDate = localFormat(dayjs().add(1, "day"));
      endDate = localFormat(dayjs().add(1, "day"));
      break;
    case "last-week":
      startDate = localFormat(dayjs().startOf("week").subtract(1, "week"));
      endDate = localFormat(dayjs().endOf("week").subtract(1, "week"));
      break;
    case "next-week":
      startDate = localFormat(dayjs().startOf("week").add(1, "week"));
      endDate = localFormat(dayjs().endOf("week").add(1, "week"));
      break;
    case "this-month":
      startDate = localFormat(dayjs().startOf("month"));
      endDate = localFormat(dayjs().endOf("month"));
      break;
    case "last-month":
      startDate = localFormat(dayjs().startOf("month").subtract(1, "month"));
      endDate = localFormat(dayjs(startDate).endOf("month"));
      break;
    case "next-month":
      startDate = localFormat(dayjs().startOf("month").add(1, "month"));
      endDate = localFormat(dayjs(startDate).endOf("month"));
      break;
    case "this-quarter":
      startDate = localFormat(dayjs().startOf("quarter" as any));
      endDate = localFormat(dayjs().endOf("quarter" as any));
      break;
    default:
      startDate = localFormat(dayjs().startOf("week"));
      endDate = localFormat(dayjs().endOf("week"));
  }

  return [startDate, endDate];
};
export const localFormat = (value: any) => {
  return value?.format("MMM DD , YYYY").toString();
};
export const dateRangeOptions = {
  today: "Today",
  all: "All",
  yesterday: "Yesterday",
  tomorrow: "Tomorrow",
  "this-week": "This week",
  "last-week": "Past week",
  "next-week": "Next week",
  "this-month": "This month",
  "last-month": "Past month",
  "next-month": "Next month",
};
export const getFormattedDateRange = (
  dateRange: any,
  format = "MMM D,YYYY"
) => {
  return [
    dayjs(dateRange[0]).format(format),
    dayjs(dateRange[1]).format(format),
  ];
};
