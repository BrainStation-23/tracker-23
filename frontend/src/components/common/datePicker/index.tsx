import dayjs from "dayjs";
import React, { useState } from "react";

// Components
import {
  Button,
  DatePicker,
  Divider,
  Dropdown,
  MenuProps,
  Popover,
  theme,
} from "antd";
const { useToken } = theme;
const { RangePicker } = DatePicker;

// Icons
import DownArrowIconSvg from "@/assets/svg/DownArrowIconSvg";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { CalendarOutlined, EditOutlined } from "@ant-design/icons";

// Types
import { FilterDateType, FilterReverseDateType } from "models/reports";
type Props = {
  selectedDate: string[];
  setSelectedDate: (data: string[]) => void;
  setFilterDateType?: (text: FilterDateType) => void;
};

const DateRangePicker = ({
  selectedDate,
  setSelectedDate,
  setFilterDateType,
}: Props) => {
  const [customDateValue, setCustomDateValue] = useState<any>([
    dayjs(),
    dayjs(),
  ]);
  const [dateRangeType, setDateRangeType] = useState<string>("this-week");
  const [customDateOpen, setCustomDateOpen] = useState<boolean>(false);
  const [dropdownText, setDropdownText] = useState<any>(selectedDate);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [customDateText, setCustomDateText] = useState<any>(
    getDateRangeArray(FilterDateType.THIS_WEEK)
  );

  const handleNext = () => {
    if (selectedDate) {
      if (dateRangeType.includes("month")) {
        const date3 = dayjs(selectedDate[1]).add(1, "day").startOf("month");
        const date4 = dayjs(date3).endOf("month");
        setDropdownText([localFormat(date3), localFormat(date4)]);
        setSelectedDate([localFormat(date3), localFormat(date4)]);
        setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
      } else {
        const timeDifference =
          dayjs(selectedDate[1]).diff(dayjs(selectedDate[0])) +
          24 * 60 * 60 * 1000;
        const date3 = dayjs(selectedDate[0]).add(timeDifference, "millisecond");
        const date4 = dayjs(selectedDate[1]).add(timeDifference, "millisecond");

        setDropdownText([localFormat(date3), localFormat(date4)]);
        setSelectedDate([localFormat(date3), localFormat(date4)]);
        setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
      }
    }
  };
  const handlePreviousClick = () => {
    if (selectedDate) {
      if (dateRangeType.includes("month")) {
        const date3 = dayjs(selectedDate[0])
          .subtract(1, "day")
          .startOf("month");
        const date4 = dayjs(date3).endOf("month");
        setDropdownText([localFormat(date3), localFormat(date4)]);
        setSelectedDate([localFormat(date3), localFormat(date4)]);
        setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
      } else {
        const timeDifference =
          dayjs(selectedDate[0]).diff(dayjs(selectedDate[1])) -
          24 * 60 * 60 * 1000;
        const date3 = dayjs(selectedDate[0]).add(timeDifference, "millisecond");
        const date4 = dayjs(selectedDate[1]).add(timeDifference, "millisecond");

        setDropdownText([localFormat(date3), localFormat(date4)]);
        setSelectedDate([localFormat(date3), localFormat(date4)]);
        setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
      }
    }
  };

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
      setDateRangeType(val.key);
      setDropdownText(getDateRangeArray(val.key));
      setSelectedDate(getDateRangeArray(val.key));
      // @ts-ignore
      setFilterDateType && setFilterDateType(FilterReverseDateType[val.key]);
      setDropdownOpen(false);
      customDateOpen && setCustomDateOpen(false);
    },
  };

  // css
  const { token } = useToken();
  const contentStyle = {
    backgroundColor: token.colorBgElevated,
    borderRadius: token.borderRadiusLG,
    boxShadow: token.boxShadowSecondary,
  };
  const menuStyle = {
    boxShadow: "none",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className="cursor-pointer rounded-l bg-inherit bg-thirdLight py-1.5 pl-1.5 text-xl hover:bg-[#F3F4F6]"
        onClick={() => handlePreviousClick()}
      >
        <LuChevronLeft />
      </div>
      <Dropdown
        className="flex cursor-pointer items-center bg-gray-50 p-1.5 hover:bg-gray-100"
        menu={menuProps}
        trigger={["click"]}
        open={dropdownOpen}
        onOpenChange={(open) => {
          setDropdownOpen(open);
          customDateOpen && !open && setCustomDateOpen(false);
        }}
        dropdownRender={(menu) => (
          <div style={contentStyle}>
            {React.cloneElement(menu as React.ReactElement, {
              style: menuStyle,
            })}

            <Divider style={{ margin: 0 }} />
            <div style={{ padding: 8 }}>
              <Popover
                placement="left"
                title={"Custom Date"}
                open={customDateOpen}
                content={
                  <div className="flex w-[570px] flex-col gap-3 ">
                    <RangePicker
                      defaultValue={[dayjs(), dayjs()]}
                      value={customDateValue}
                      format={"DD/MM/YYYY"}
                      clearIcon={false}
                      open={customDateOpen}
                      bordered={false}
                      inputReadOnly={true}
                      autoFocus={true}
                      className="w-[250px]"
                      popupClassName="custom-rangePicker-dropdown"
                      onChange={(values) => {
                        setCustomDateValue(values);
                        setCustomDateText([
                          localFormat(values[0]),
                          localFormat(values[1]),
                        ]);
                      }}
                    />
                    <div className="mt-[300px] flex flex-row-reverse gap-3 px-3">
                      <Button
                        onClick={() => {
                          setFilterDateType &&
                            setFilterDateType(FilterDateType.CUSTOM_DATE);
                          setDropdownText(customDateText);
                          setSelectedDate(customDateText);
                          setCustomDateOpen(!customDateOpen);
                          setDropdownOpen(!customDateOpen);
                        }}
                      >
                        Confirm{" "}
                      </Button>
                      <Button
                        onClick={() => setCustomDateOpen(!customDateOpen)}
                      >
                        Cancel{" "}
                      </Button>
                    </div>
                  </div>
                }
                trigger="click"
              >
                <Button
                  className="flex w-full items-center pl-1.5 text-left hover:bg-gray-100"
                  type="ghost"
                  style={{
                    clear: "both",
                    margin: 0,
                    fontWeight: "normal",
                    fontSize: "14px",
                    lineHeight: 1.5714285714285714,
                    cursor: "pointer",
                    transition: " all 0.2s",
                    borderRadius: "4px",
                  }}
                  onClick={() => setCustomDateOpen(!customDateOpen)}
                >
                  <EditOutlined /> <div> Custom Date</div>
                </Button>
              </Popover>
            </div>
          </div>
        )}
      >
        <div className="flex items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2">
            <CalendarOutlined />
            {dropdownText && (
              <span>
                {dropdownText[0]} - {dropdownText[1]}
              </span>
            )}
          </div>
          <DownArrowIconSvg />
        </div>
      </Dropdown>
      <div
        className="cursor-pointer rounded-r bg-thirdLight py-1.5 pr-1.5 text-xl hover:bg-[#F3F4F6]"
        onClick={() => handleNext()}
      >
        <LuChevronRight />
      </div>
    </div>
  );
};

export default DateRangePicker;

export const getDateRangeArray = (key: string, dates?: any) => {
  let startDate, endDate;
  switch (key) {
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
export const timeFormat = (value: any) => {
  return value?.format("HH:mm:ss").toString();
};
export const dateRangeOptions = {
  today: "Today",
  yesterday: "Yesterday",
  tomorrow: "Tomorrow",
  "this-week": "This week",
  "last-week": "Past week",
  "next-week": "Next week",
  "this-month": "This month",
  "last-month": "Past month",
  "next-month": "Next month",
};

export function getArrayOfDatesInRange(startDate: any, endDate: any) {
  const dates = [];
  let currentDate = dayjs(startDate);

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
    dates.push(currentDate.format("MMM DD, YYYY"));
    currentDate = currentDate.add(1, "day");
  }

  return dates;
}

export const getFormattedDateRange = (
  dateRange: any,
  format = "MMM D,YYYY"
) => {
  return [
    dayjs(dateRange[0]).format(format),
    dayjs(dateRange[1]).format(format),
  ];
};

export function formatUserData(dataArray: any[]) {
  if (!dataArray) dataArray = [];
  return dataArray.map((data: any) => {
    const result: any = {
      user: `${data.firstName} ${data.lastName}`,
    };
    result.totalHours = 0;
    result.picture = data.picture;
    data.sessions.forEach((session: any) => {
      const sessionDate = dayjs(session.day);
      const formattedDate = sessionDate.format("MMM DD, YYYY");
      result[`${formattedDate}`] = session.hour;
      result.totalHours += session.hour; // Add session hour to total hours
    });

    return result;
  });
}
