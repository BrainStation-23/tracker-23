import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

// Components
import {
  Button,
  DatePicker,
  Divider,
  Dropdown,
  MenuProps,
  Tooltip,
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
import classNames from "classnames";

import StyleWrapperDatePicker from "./styleWrapperDatePicker";

type Props = {
  className?: string;
  loading?: boolean;
  selectedDate: string[] | string;
  // eslint-disable-next-line no-unused-vars
  setSelectedDate: (data: string[]) => void;
  // eslint-disable-next-line no-unused-vars
  setFilterDateType?: (text: FilterDateType) => void;
  scrum?: boolean;
};

const DateRangePicker = ({
  loading,
  className,
  selectedDate,
  setSelectedDate,
  setFilterDateType,
  scrum,
}: Props) => {
  const [dateRangeType, setDateRangeType] = useState<string>("this-week");
  const [dropdownText, setDropdownText] = useState<any>(selectedDate);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [customDateText, setCustomDateText] = useState<any>(selectedDate);

  if (!selectedDate) {
    setCustomDateText(getDateRangeArray(FilterDateType.THIS_WEEK, scrum));
  }
  const handleNext = () => {
    if (selectedDate && !loading) {
      if (dateRangeType.includes("month")) {
        const date3 = Array.isArray(selectedDate)
          ? dayjs(selectedDate[1]).add(1, "day").startOf("month")
          : dayjs(selectedDate).add(1, "day").startOf("month");
        const date4 = dayjs(date3).endOf("month");
        if (scrum) {
          setDropdownText([localFormat(date3), localFormat(date3)]);
          setSelectedDate([localFormat(date3), localFormat(date3)]);
          setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
        } else {
          setDropdownText([localFormat(date3), localFormat(date4)]);
          setSelectedDate([localFormat(date3), localFormat(date4)]);
          setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
        }
      } else {
        const timeDifference = Array.isArray(selectedDate)
          ? dayjs(selectedDate[1]).diff(dayjs(selectedDate[0])) +
            24 * 60 * 60 * 1000
          : dayjs(selectedDate).diff(dayjs(selectedDate)) + 24 * 60 * 60 * 1000;
        const date3 = Array.isArray(selectedDate)
          ? dayjs(selectedDate[0]).add(timeDifference, "millisecond")
          : dayjs(selectedDate).add(timeDifference, "millisecond");
        const date4 = Array.isArray(selectedDate)
          ? dayjs(selectedDate[1]).add(timeDifference, "millisecond")
          : dayjs(selectedDate).add(timeDifference, "millisecond");

        if (scrum) {
          setDropdownText([localFormat(date3), localFormat(date3)]);
          setSelectedDate([localFormat(date3), localFormat(date3)]);
          setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
        } else {
          setDropdownText([localFormat(date3), localFormat(date4)]);
          setSelectedDate([localFormat(date3), localFormat(date4)]);
          setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
        }
      }
    }
  };
  const handlePreviousClick = () => {
    if (selectedDate && !loading) {
      if (dateRangeType.includes("month")) {
        const date3 = Array.isArray(selectedDate)
          ? dayjs(selectedDate[0]).subtract(1, "day").startOf("month")
          : dayjs(selectedDate).subtract(1, "day").startOf("month");
        const date4 = Array.isArray(selectedDate)
          ? dayjs(date3).endOf("month")
          : date3;
        if (scrum) {
          setDropdownText([localFormat(date3), localFormat(date3)]);
          setSelectedDate([localFormat(date3), localFormat(date3)]);
          setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
        } else {
          setDropdownText([localFormat(date3), localFormat(date4)]);
          setSelectedDate([localFormat(date3), localFormat(date4)]);
          setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
        }
      } else {
        const timeDifference = Array.isArray(selectedDate)
          ? dayjs(selectedDate[0]).diff(dayjs(selectedDate[1])) -
            24 * 60 * 60 * 1000
          : dayjs(selectedDate).diff(dayjs(selectedDate)) - 24 * 60 * 60 * 1000;
        const date3 = Array.isArray(selectedDate)
          ? dayjs(selectedDate[0]).add(timeDifference, "millisecond")
          : dayjs(selectedDate).add(timeDifference, "millisecond");
        const date4 = Array.isArray(selectedDate)
          ? dayjs(selectedDate[1]).add(timeDifference, "millisecond")
          : dayjs(selectedDate).add(timeDifference, "millisecond");

        if (scrum) {
          setDropdownText([localFormat(date3), localFormat(date3)]);
          setSelectedDate([localFormat(date3), localFormat(date3)]);
          setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
        } else {
          setDropdownText([localFormat(date3), localFormat(date4)]);
          setSelectedDate([localFormat(date3), localFormat(date4)]);
          setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
        }
      }
    }
  };

  const items: MenuProps["items"] = [];
  let tmp;
  if (scrum) {
    tmp = Object.entries(scrumDateRangeOptions);
  } else {
    tmp = Object.entries(dateRangeOptions);
  }
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
      setDropdownText(getDateRangeArray(val.key, scrum));
      setSelectedDate(getDateRangeArray(val.key, scrum));
      // @ts-ignore
      setFilterDateType && setFilterDateType(FilterReverseDateType[val.key]);
      setDropdownOpen(false);
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

  useEffect(() => {
    setDropdownText(customDateText);
    setSelectedDate(customDateText);
  }, [customDateText, setSelectedDate]);

  return (
    <div
      className={classNames(
        "flex w-full items-center justify-center gap-2",
        className
      )}
    >
      <Tooltip title="Date Range">
        <CalendarOutlined size={20} />
      </Tooltip>
      <div className="flex w-full items-center">
        <Button
          type="text"
          className="cursor-pointer rounded-l bg-inherit bg-thirdLight py-1.5 pl-1.5 text-xl hover:bg-[#F3F4F6]"
          onClick={handlePreviousClick}
          disabled={loading}
        >
          <LuChevronLeft />
        </Button>
        <Dropdown
          className="flex cursor-pointer items-center bg-gray-50 p-1.5 hover:bg-gray-100"
          menu={menuProps}
          trigger={["click"]}
          open={dropdownOpen}
          onOpenChange={(open) => {
            setDropdownOpen(open);
          }}
          dropdownRender={(menu) => (
            <div style={contentStyle}>
              {React.cloneElement(menu as React.ReactElement, {
                style: menuStyle,
              })}

              <Divider style={{ margin: 0 }} />
              <div className="flex flex-row gap-2 px-3 py-1">
                <EditOutlined /> <div> Custom Date</div>
              </div>

              <RangePicker
                format={"DD/MM/YYYY"}
                allowClear={false}
                bordered={false}
                inputReadOnly={false}
                autoFocus={true}
                popupClassName="custom-rangePicker-dropdown"
                needConfirm
                allowEmpty={[false, false]}
                onOk={(values) => {
                  if (values[0] && values[1]) {
                    setFilterDateType &&
                      setFilterDateType(FilterDateType.CUSTOM_DATE);
                    setCustomDateText([
                      localFormat(values[0]),
                      localFormat(values[1]),
                    ]);
                    setDropdownOpen(false);
                  }
                }}
                panelRender={(panelNode) => (
                  <StyleWrapperDatePicker>{panelNode}</StyleWrapperDatePicker>
                )}
              />
            </div>
          )}
        >
          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              {dropdownText && (
                <span>
                  {dropdownText[0]} - {dropdownText[1]}
                </span>
              )}
            </div>
            <DownArrowIconSvg />
          </div>
        </Dropdown>
        <Button
          type="text"
          disabled={loading}
          onClick={handleNext}
          className="cursor-pointer rounded-r bg-thirdLight py-1.5 pr-1.5 text-xl hover:bg-[#F3F4F6]"
        >
          <LuChevronRight />
        </Button>
      </div>
    </div>
  );
};

export default DateRangePicker;

export const getDateRangeArray = (key: string = "", scrum?: boolean) => {
  const normalizedKey = key.toLowerCase();
  let startDate, endDate;
  switch (normalizedKey) {
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

  if (scrum) {
    return [startDate, startDate];
  }
  return [startDate, endDate];
};
export const localFormat = (value: any) => {
  return value?.format("DD MMM YYYY").toString();
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

export const scrumDateRangeOptions = {
  today: "Today",
  yesterday: "Yesterday",
  tomorrow: "Tomorrow",
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
export const getDate = (key: string) => {
  const normalizedKey = key.toLowerCase();
  let date;

  switch (normalizedKey) {
    case "today":
      date = dayjs();
      break;
    case "yesterday":
      date = dayjs().subtract(1, "day");
      break;
    case "tomorrow":
      date = dayjs().add(1, "day");
      break;
    default:
      date = dayjs();
  }

  return localFormat(date);
};

export const singleDateOptions = {
  TODAY: "Today",
  YESTERDAY: "Yesterday",
  TOMORROW: "Tomorrow",
};

export function SingleDatePicker({
  loading,
  className,
  selectedDate,
  setSelectedDate,
  setFilterDateType,
}: {
  className?: string;
  loading?: boolean;
  selectedDate: string;
  setSelectedDate: (data: string) => void;
  setFilterDateType?: (text: FilterDateType) => void;
}) {
  const [dateType, setDateType] = useState<string>("today");
  const [dropdownText, setDropdownText] = useState<any>(selectedDate);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [customDateText, setCustomDateText] = useState<any>(selectedDate);
  const oneDayInMilliSecond = 24 * 60 * 60 * 1000;

  if (!selectedDate) {
    setCustomDateText(getDate(FilterDateType.TODAY));
  }
  const handleNext = () => {
    if (selectedDate && !loading) {
      const newDate = dayjs(selectedDate).add(
        oneDayInMilliSecond,
        "millisecond"
      );

      setDropdownText(localFormat(newDate));
      setSelectedDate(localFormat(newDate));
      setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
    }
  };
  const handlePreviousClick = () => {
    if (selectedDate && !loading) {
      const newDate = dayjs(selectedDate).add(
        -1 * oneDayInMilliSecond,
        "millisecond"
      );

      setDropdownText(localFormat(newDate));
      setSelectedDate(localFormat(newDate));
      setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
    }
  };

  const items: MenuProps["items"] = [];
  let tmp;
  tmp = Object.entries(singleDateOptions);

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
      setDateType(val.key);
      setDropdownText(getDate(val.key));
      setSelectedDate(getDate(val.key));
      setFilterDateType?.(
        FilterDateType[val.key as keyof typeof FilterDateType]
      );
      setDropdownOpen(false);
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

  const handleDateChange = (newDate: dayjs.Dayjs) => {
    const formattedDate = localFormat(newDate);
    setFilterDateType?.(FilterDateType.CUSTOM_DATE);
    setCustomDateText(formattedDate);
    setDropdownOpen(false);
  };

  useEffect(() => {
    setDropdownText(customDateText);
    setSelectedDate(customDateText);
  }, [customDateText, setSelectedDate]);

  return (
    <div
      className={classNames(
        "flex w-full items-center justify-center gap-2",
        className
      )}
    >
      <Tooltip title="Date Range">
        <CalendarOutlined size={20} />
      </Tooltip>
      <div className="flex w-full items-center">
        <Button
          type="text"
          className="cursor-pointer rounded-l bg-inherit bg-thirdLight py-1.5 pl-1.5 text-xl hover:bg-[#F3F4F6]"
          onClick={handlePreviousClick}
          disabled={loading}
        >
          <LuChevronLeft />
        </Button>
        <Dropdown
          className="flex cursor-pointer items-center bg-gray-50 p-1.5 hover:bg-gray-100"
          menu={menuProps}
          trigger={["click"]}
          open={dropdownOpen}
          onOpenChange={(open) => {
            setDropdownOpen(open);
          }}
          dropdownRender={(menu) => (
            <div style={contentStyle}>
              {React.cloneElement(menu as React.ReactElement, {
                style: menuStyle,
              })}

              <Divider style={{ margin: 0 }} />
              <div className="flex flex-row gap-2 px-3 py-1">
                <EditOutlined /> <div> Custom Date</div>
              </div>
              <DatePicker
                format={"DD/MM/YYYY"}
                allowClear={false}
                inputReadOnly={false}
                autoFocus={true}
                popupClassName="custom-rangePicker-dropdown"
                onChange={(value) => {
                  if (value) {
                    handleDateChange(value);
                    setDropdownOpen(false);
                  }
                }}
              />
            </div>
          )}
        >
          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              {dropdownText && <span>{dropdownText}</span>}
            </div>
            <DownArrowIconSvg />
          </div>
        </Dropdown>
        <Button
          type="text"
          disabled={loading}
          onClick={handleNext}
          className="cursor-pointer rounded-r bg-thirdLight py-1.5 pr-1.5 text-xl hover:bg-[#F3F4F6]"
        >
          <LuChevronRight />
        </Button>
      </div>
    </div>
  );
}
