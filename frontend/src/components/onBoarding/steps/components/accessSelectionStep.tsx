import { Select } from "antd";
import React, { useState } from "react";

import MyFormItem from "@/components/common/form/MyFormItem";
import { OnBoardingQuestionDto } from "models/onboarding";

const { Option } = Select;
type Props = {
  data: OnBoardingQuestionDto[];
};

const AccessSelectionStep = ({ data }: Props) => {
  const [answers, setAnswers] = useState<any>({});

  const handleSelectChange = (question: any, value: any) => {
    setAnswers((prevAnswers: any) => ({ ...prevAnswers, [question]: value }));
  };
  return (
    <>
      {data?.map(
        (obj, index) =>
          (index === 0 || answers[data[index - 1].type]) && (
            <MyFormItem
              key={index}
              label={obj.question}
              name={obj.type}
              rules={[
                {
                  required: index < 5,
                  message: `Please input your ${obj.type}`,
                },
              ]}
            >
              {index >= 5 ? (
                <Select
                  mode="multiple"
                  onChange={(value) => handleSelectChange(obj.type, value)}
                  placeholder={obj.placeholder}
                >
                  {obj.options.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              ) : (
                <Select
                  onChange={(value) => handleSelectChange(obj.type, value)}
                  placeholder={obj.placeholder}
                >
                  {obj.options.map((option) => (
                    <Option key={option} value={option}>
                      {option}
                    </Option>
                  ))}
                </Select>
              )}
            </MyFormItem>
          )
      )}
    </>
  );
};

export default AccessSelectionStep;
