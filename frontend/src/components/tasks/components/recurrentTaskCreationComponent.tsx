import {
  Checkbox,
  DatePicker,
  Form,
  Input,
  Radio,
  Select,
  Tooltip,
} from "antd";
import { useState } from "react";
import dayjs, { Dayjs } from "dayjs";

import { QuestionCircleOutlined } from "@ant-design/icons";
import { capitalizeFirstLetter, getPositionSuffix } from "@/services/helpers";

const frequencyArray = [
  {
    value: "DAY",
    title: "Day",
    tooltipText: "Repeat Every Day",
  },
  {
    value: "WEEK",
    title: "Week",
    tooltipText: "Repeat Every Week on this Day",
  },
  {
    value: "MONTH",
    title: "Month",
    tooltipText: "Repeat Every Month on this Day",
  },
];

const initialValue = [
  { day: "SUNDAY", checked: false },
  { day: "MONDAY", checked: false },
  { day: "TUESDAY", checked: false },
  { day: "WEDNESDAY", checked: false },
  { day: "THURSDAY", checked: false },
  { day: "FRIDAY", checked: false },
  { day: "SATURDAY", checked: false },
];

type Props = {
  startDate: Dayjs;
};

const RecurrentTaskCreationComponent = ({ startDate }: Props) => {
  const [week, setWeek] = useState(initialValue);
  const [dateValue, setDateValue] = useState(dayjs());
  const [frequencyValue, setFrequencyValue] = useState("");
  const [occurrenceValue, setOccurrenceValue] = useState(1);
  const [radioButtonValue, setRadioButtonValue] = useState(1);

  const handleFrequencyChange = (value: string) => {
    setFrequencyValue(value);
  };
  const handleDayCheck = (value: boolean, dayName: string) => {
    const tmp = week?.map((day) =>
      day.day === dayName ? { ...day, checked: value } : day
    );
    setWeek(tmp);
  };

  const handelRadioButtonChange = (value: number) => {
    setRadioButtonValue(value);
  };
  const handelDateChange = (value: any) => {
    setDateValue(value);
  };
  const handelOccurrenceChange = (value: number) => {
    setOccurrenceValue(value);
  };
  const validateEndDate = (_: any, value: any) => {
    if (value && startDate.isValid()) {
      const endDate = dayjs(value);
      if (
        endDate.isSame(startDate, "day") ||
        endDate.isAfter(startDate, "day")
      ) {
        return Promise.resolve();
      }
      return Promise.reject(
        "End date must be greater than or equal to start date"
      );
    }
    return Promise.reject("Please select a valid end date");
  };

  const getDayFreq = () => {
    const dayNumber = startDate.date();
    const dayOfWeek = capitalizeFirstLetter(
      week[dayNumber % 7].day.toLowerCase()
    );
    const totalDaysInMonth = startDate.daysInMonth();
    if (totalDaysInMonth - dayNumber <= 7) {
      return "last " + dayOfWeek;
    } else {
      return getPositionSuffix(Math.round(dayNumber / 7)) + " " + dayOfWeek;
    }
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className=" font-medium">Repeat Every :</div>
        <Form.Item
          name="repeat"
          initialValue={1}
          className="m-0 w-[50px] "
          rules={[{ required: true }]}
        >
          <Input type="number" className="pr-0.5" />
        </Form.Item>
        <Form.Item
          name="repeatType"
          rules={[{ required: true }]}
          className="m-0 w-[150px]"
          initialValue={"DAY"}
        >
          <Select
            placeholder="Select Frequency"
            onChange={handleFrequencyChange}
            options={frequencyArray.map((frequency) => {
              return {
                value: frequency.value,
                label: (
                  <div className="flex items-center justify-between">
                    {frequency.title}
                    <Tooltip title={frequency.tooltipText}>
                      <QuestionCircleOutlined />
                    </Tooltip>
                  </div>
                ),
              };
            })}
          />
        </Form.Item>
      </div>

      {frequencyValue === "WEEK" && (
        <div className="flex flex-col justify-start gap-2">
          <div className=" font-medium">Repeat On</div>

          <Form.Item
            name="weekDays"
            className="m-0"
            rules={[
              {
                required: true,
                message: "Please select at least one day",
              },
            ]}
          >
            <Checkbox.Group>
              <div className="flex gap-2 font-semibold">
                {week.map((el) => (
                  <Checkbox
                    key={el.day}
                    checked={el.checked}
                    value={el.day}
                    onChange={(e) => handleDayCheck(e.target.checked, el.day)}
                    className={`custom-checkbox hidden-checkbox ${
                      el.checked ? "checked" : ""
                    }`}
                  >
                    <Tooltip title={el.day}> {el.day[0]}</Tooltip>
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>
        </div>
      )}
      {frequencyValue === "MONTH" && startDate && (
        <Form.Item
          name="monthlyRepeat"
          rules={[{ required: true }]}
          className="m-0 w-[250px]"
          initialValue={"1"}
        >
          <Select
            placeholder="Select Frequency"
            options={[
              { value: "1", label: `Monthly on ${startDate.date()}` },
              { value: "2", label: `Monthly on ${getDayFreq()}` },
            ]}
          />
        </Form.Item>
      )}
      <div>
        <div className=" font-medium">Ends</div>
        <Radio.Group
          onChange={(e) => handelRadioButtonChange(e.target.value)}
          value={radioButtonValue}
          defaultValue={1}
          className="flex flex-col gap-2"
        >
          <Radio value={1}>
            <div className="flex items-center gap-2">
              <div> On</div>
              <Form.Item
                name={radioButtonValue === 1 ? "endDate" : null}
                initialValue={dateValue}
                className="m-0"
                rules={[
                  { required: true, message: "Please select an end date" },
                  { validator: validateEndDate },
                ]}
              >
                <DatePicker
                  defaultValue={dayjs()}
                  onChange={(e) => handelDateChange(e)}
                  className="m-0"
                  value={dateValue}
                  disabled={radioButtonValue !== 1}
                />
              </Form.Item>
            </div>
          </Radio>
          <Radio value={2}>
            <div className="flex items-center gap-2">
              <div>After</div>
              <Form.Item
                name={radioButtonValue === 2 ? "occurrences" : null}
                initialValue={1}
                className="m-0 w-[50px]"
                rules={[{ required: true }]}
              >
                <Input
                  type="number"
                  value={occurrenceValue}
                  className="pr-0.5"
                  onChange={(e) =>
                    handelOccurrenceChange(Number(e.target.value))
                  }
                  disabled={radioButtonValue !== 2}
                />
              </Form.Item>
              Occurrences
            </div>
          </Radio>
        </Radio.Group>
      </div>
    </div>
  );
};

export default RecurrentTaskCreationComponent;
