import { Radio, RadioChangeEvent, Space } from "antd";
import { useState } from "react";

const PurposeStep = () => {
  const [value, setValue] = useState(1);

  const onChange = (e: RadioChangeEvent) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };
  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="px-1 text-xl font-semibold text-black">
        How are you planning to use Tracker23?
      </div>
      <div className="pl-6">
        <Radio.Group onChange={onChange} value={value}>
          <Space direction="vertical">
            <Radio value={1}>Form Work</Radio>
            <Radio value={2}>For Education</Radio>
            <Radio value={3}>For Personal Project</Radio>
          </Space>
        </Radio.Group>
      </div>
    </div>
  );
};

export default PurposeStep;
