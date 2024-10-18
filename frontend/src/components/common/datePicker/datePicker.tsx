import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { localFormat } from ".";
import React from "react";
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
  selectedDate: string | Date;
  setSelectedDate: (data: string[]) => void;
  setFilterDateType?: (text: FilterDateType) => void;
};

const DatePickerComponent = ({
  loading,
  className,
  selectedDate,
  setSelectedDate,
  setFilterDateType,
}: Props) => {
  const [dateType, setDateType] = useState<string>("today");
  const [dropdownText, setDropdownText] = useState<any>(selectedDate);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  const handleNext = () => {
    if (selectedDate && !loading) {
      const nextDate = dayjs(selectedDate).add(1, "day");
      setDropdownText(localFormat(nextDate));
      setSelectedDate(localFormat(nextDate));
      setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
    }
  };

  const handlePreviousClick = () => {
    if (selectedDate && !loading) {
      const prevDate = dayjs(selectedDate).subtract(1, "day");
      setDropdownText(localFormat(prevDate));
      setSelectedDate(localFormat(prevDate));
      setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
    }
  };

  // Updated menuProps with proper handling of string keys
  const menuProps: MenuProps = {
    items: [
      {
        label: "Today",
        key: "TODAY", // Ensure that the key matches the enum values
        icon: <CalendarOutlined />,
      },
      {
        label: "Yesterday",
        key: "YESTERDAY", // Ensure that the key matches the enum values
        icon: <CalendarOutlined />,
      },
      // Additional preset date options
    ],
    onClick: (info) => {
      const { key } = info;
      
      // Check if the key is a valid key of FilterDateType
      if (key in FilterDateType) {
        setDateType(key);
        const newDate = getDateForType(key as keyof typeof FilterDateType); // Cast key
        setDropdownText(localFormat(newDate));
        setSelectedDate(localFormat(newDate));

        // Set filter date type
        setFilterDateType && setFilterDateType(FilterDateType[key as keyof typeof FilterDateType]);
      }
      setDropdownOpen(false);
    },
  };

  // Custom date logic
  const getDateForType = (type: keyof typeof FilterDateType) => {
    switch (type) {
      case "TODAY":
        return dayjs();
      case "YESTERDAY":
        return dayjs().subtract(1, "day");
      default:
        return dayjs();
    }
  };

  useEffect(() => {
    setDropdownText(localFormat(selectedDate));
    setSelectedDate(localFormat(selectedDate));
  }, [selectedDate]);

  return (
    <div
      className={classNames(
        "flex w-full items-center justify-center gap-2",
        className
      )}
    >
      <Tooltip title="Select Date">
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
          onOpenChange={(open) => setDropdownOpen(open)}
        >
          <div className="flex items-center justify-between gap-2 text-sm">
            <div className="flex items-center gap-2">
              {dropdownText && <span>{dropdownText}</span>}
            </div>
            <LuChevronRight />
          </div>
        </Dropdown>
        <DatePicker
          format={"DD/MM/YYYY"}
          value={dayjs(selectedDate)}
          onChange={(date) => {
            setSelectedDate(localFormat(date));
            setDropdownText(localFormat(date));
            setFilterDateType && setFilterDateType(FilterDateType.CUSTOM_DATE);
          }}
        />
      </div>
    </div>
  );
};

export default DatePickerComponent;
