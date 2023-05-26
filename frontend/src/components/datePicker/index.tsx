import {
  Button,
  DatePicker,
  Divider,
  Dropdown,
  Menu,
  MenuProps,
  Popover,
  theme,
} from "antd";
import dayjs from "dayjs";
import React, { useState } from "react";

import DownArrowIconSvg from "@/assets/svg/DownArrowIconSvg";
import { CalendarOutlined, EditOutlined } from "@ant-design/icons";

const { useToken } = theme;
const { RangePicker } = DatePicker;
const DateRangePicker = ({ setSelectedDate }: any) => {
  const [customDateValue, setCustomDateValue] = useState<any>([
    dayjs(),
    dayjs(),
  ]);
  const [customDateOpen, setCustomDateOpen] = useState<boolean>(false);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [dropdownText, setDropdownText] = useState<any>(
    getDateRangeArray("this-week")
  );
  const [customDateText, setCustomDateText] = useState<any>(
    getDateRangeArray("this-week")
  );
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
      setDropdownOpen(false);
      customDateOpen && setCustomDateOpen(false);
    },
  };
  const dateFormat = "DD/MM/YYYY";
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
    <>
      <div className="w-72">
        <Dropdown
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
                        format={dateFormat}
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
                    className="flex w-full items-center pl-[5px] text-left hover:bg-gray-100"
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
    // case "all":
    //   return null;
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
  // all: "All",
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
<Menu>
  <Menu.Item>
    <Popover
      zIndex={9999}
      id="dateRangePopover"
      trigger="click"
      placement={"left"}
      // open={true}
      destroyTooltipOnHide={false}
      getPopupContainer={() =>
        document.getElementById("dateRangePopoverWrapper")!
      }
      content={
        <div
          className="absolute"
          // style={styles.popoverContent}
        >
          <div id="custom-range-picker">
            {/* <CustomRangePicker
            availableDate={availableDate}
            syncPeriod={syncPeriod}
            {...{ pickerValue, setPickerValue, minDay }}
          /> */}
          </div>
          <div
            // className={css.actionWrapper}
            style={{ textAlign: "right" }}
          >
            <Button
            //  onClick={datePickerClickHandler}
            >
              Cancel
            </Button>
            <Button
            // onClick={() =>
            //   handelRangePickerChanges(pickerValue)
            // }
            // className={css.ok}
            >
              Confirm
            </Button>
          </div>
        </div>
      }
    >
      {/* <DatePickerRow
      date={"Custom date"}
      icon={<EditOutlined />}
      selected={
        selectedDateType === CustomDateType.CustomDate ? (
          <SelectedIcon />
        ) : null
      }
    />{" "} */}
      Custom Range
    </Popover>
  </Menu.Item>
</Menu>;
