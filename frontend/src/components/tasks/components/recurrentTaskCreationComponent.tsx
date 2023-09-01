import { QuestionCircleOutlined } from "@ant-design/icons";
import {
  Checkbox,
  DatePicker,
  Form,
  Input,
  Radio,
  Select,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";

const RecurrentTaskCreationComponent = () => {
  const handleFrequencyChange = (value: string) => {
    console.log(`Selected: ${value}`);
    setFrequencyValue(value);
  };
  const [radioButtonValue, setRadioButtonValue] = useState(1);
  const [occurrenceValue, setOccurrenceValue] = useState(1);
  const [dateValue, setDateValue] = useState(dayjs());
  const [frequencyValue, setFrequencyValue] = useState("");
  const [week, setWeek] = useState([
    { day: "Sunday", checked: false },
    { day: "Monday", checked: false },
    { day: "Tuesday", checked: false },
    { day: "Wednesday", checked: false },
    { day: "Thursday", checked: false },
    { day: "Friday", checked: false },
    { day: "Saturday", checked: false },
  ]);
  const handleDayCheck = (value: boolean, dayName: string) => {
    console.log(
      "🚀 ~ file: recurrentTaskCreationComponent.tsx:19 ~ RecurrentTaskCreationComponent ~ value:",
      value
    );
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

  return (
    <>
      <div className="flex flex-col gap-4">
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
            name="frequency"
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
                  {week.map((day) => (
                    <Checkbox
                      checked={day.checked}
                      value={day.day}
                      onChange={(e) =>
                        handleDayCheck(e.target.checked, day.day)
                      }
                      className={`custom-checkbox hidden-checkbox ${
                        day.checked ? "checked" : ""
                      }`}
                    >
                      <Tooltip title={day.day}> {day.day[0]}</Tooltip>
                    </Checkbox>
                  ))}
                </div>
              </Checkbox.Group>
            </Form.Item>
          </div>
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
                  rules={[{ required: true }]}
                  className="m-0"
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
    </>
  );
};

export default RecurrentTaskCreationComponent;
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
