import { DatePicker, Space } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
const DateRangePicker = () => {
  const today = dayjs();
  const [dates, setDates] = useState<any>([today.subtract(7, "day"), today]);
  const [value, setValue] = useState<any>(null);
  console.log(
    "🚀 ~ file: index.tsx:9 ~ DateRangePicker ~ dayjs().date():",
    today
  );
  console.log("🚀 ~ file: index.tsx:6 ~ DateRangePicker ~ dates:", dates);
  console.log("🚀 ~ file: index.tsx:7 ~ DateRangePicker ~ value:", value);

  return (
    <>
      <div className="w-60">
        <RangePicker
          allowClear
          value={dates}
          // defaultValue={[today.subtract(7, "day"), today]}
          onCalendarChange={(val) => setDates(val)}
          onChange={(val) => setValue(val)}
        />
      </div>
    </>
  );
};

export default DateRangePicker;
