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
              noStar={true}
              label={obj.question}
              name={obj.type}
              className="w-fit"
              rules={[
                {
                  required: true,
                  message: `Please input your ${obj.type}`,
                },
              ]}
            >
              {data[index].type === "pastExperiences" ? (
                <Select
                  mode="tags"
                  maxTagCount={2}
                  className="min-w-[150px]"
                  onChange={(value) => handleSelectChange(obj.type, value)}
                  placeholder={obj.placeholder}
                  allowClear={true}
                  dropdownMatchSelectWidth={false}
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
                  className="w-[300px]"
                  dropdownMatchSelectWidth={false}
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
