import { Select } from "antd";
import React, { useState } from "react";

import MyFormItem from "@/components/common/form/MyFormItem";

const { Option } = Select;

const AccessSelectionStep = () => {
  const [answers, setAnswers] = useState<any>({});

  const handleSelectChange = (question: any, value: any) => {
    setAnswers((prevAnswers: any) => ({ ...prevAnswers, [question]: value }));
  };

  const onFinish = (values: any) => {
    console.log("Form values:", values);
  };

  const professionOptions = [
    "Software Developer",
    "Designer",
    "Product Manager",
    "Data Scientist",
  ];
  const roleOptions = [
    "Frontend Developer",
    "Backend Developer",
    "UI/UX Designer",
    "Product Owner",
  ];
  const interestsOptions = [
    "Web Development",
    "Machine Learning",
    "UI/UX Design",
    "Project Management",
  ];
  const howDidYouKnowOptions = [
    "Online Search",
    "Friend/Colleague Recommendation",
    "Social Media",
    "Event/Conference",
  ];
  const yesNoOptions = ["Yes", "No"];

  const questions = [
    "What is your profession?",
    "What is your role?",
    "What are you interested in?",
    "How did you know about this application?",
    "Have you had any previous experience with similar task management tools?",
    "Which task management system have you used in the last 2 years?",
    "Which task management software are you currently using?",
  ];

  const options = [
    professionOptions,
    roleOptions,
    interestsOptions,
    howDidYouKnowOptions,
    yesNoOptions,
    ["Jira", "Trello", "Google Calendar", "Teams Calendar"],
    ["Jira", "Trello", "Google Calendar", "Teams Calendar"],
  ];

  const placeholders = [
    "Select your profession",
    "Select your role",
    "Select your interests",
    "Select how you knew about the application",
    "Select Yes or No",
    "Select task management system(s) used in the last 2 years",
    "Select current task management software(s)",
  ];

  return (
    <>
      {questions.map(
        (question, index) =>
          (index === 0 || answers[questions[index - 1]]) && (
            <MyFormItem
              key={index}
              label={question}
              name={`question${index + 1}`}
              rules={[
                {
                  required: index < 5,
                  message: `Please input your ${question}`,
                },
              ]}
            >
              <Select
                //@ts-ignore
                mode={index >= 5 ? "multiple" : "default"}
                onChange={(value) => handleSelectChange(question, value)}
                placeholder={placeholders[index]}
              >
                {options[index].map((option) => (
                  <Option key={option} value={option}>
                    {option}
                  </Option>
                ))}
              </Select>
            </MyFormItem>
          )
      )}
    </>
  );
};

export default AccessSelectionStep;
