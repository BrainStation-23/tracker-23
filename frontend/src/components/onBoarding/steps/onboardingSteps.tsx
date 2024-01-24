import { Form, message, Steps, theme } from "antd";
import { userAPI } from "APIs";
import { OnBoardingQuestionDto } from "models/onboarding";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { changeWorkspaceReloadStatusSlice } from "@/storage/redux/workspacesSlice";

import AccessSelectionStep from "./components/accessSelectionStep";
import InviteSection from "./components/inviteSection";

const OnboardingSteps: React.FC = () => {
  const dispatch = useDispatch();
  const user = useAppSelector((state: RootState) => state.userSlice.user);
  const { onboadingSteps } = user;

  const { token } = theme.useToken();

  const findCurrentStep = () => {
    let temp: number = 0;
    for (const step of onboadingSteps) {
      if (step.completed) temp = step.index;
    }
    return temp;
  };
  const [current, setCurrent] = useState(findCurrentStep());
  const [emails, setEmails] = useState<string[]>([]);
  console.log("🚀 ~ file: onboardingSteps.tsx:27 ~ emails:", emails);
  const [accountName, setAccountName] = useState(null);
  const data: OnBoardingQuestionDto[] = [
    {
      question: "What is your profession?",
      type: "profession",
      options: [
        "Software Developer",
        "Designer",
        "Product Manager",
        "Data Scientist",
      ],
      answer: "",
      placeholder: "Select your profession",
    },
    {
      question: "What is your role?",
      type: "role",
      options: [
        "Frontend Developer",
        "Backend Developer",
        "UI/UX Designer",
        "Product Owner",
      ],
      answer: "",
      placeholder: "Select your role",
    },
    {
      question: "What are you interested in?",
      type: "interests",
      options: [
        "Web Development",
        "Machine Learning",
        "UI/UX Design",
        "Project Management",
      ],
      answer: "",
      placeholder: "Select your interests",
    },
    {
      question: "How did you know about this application?",
      type: "introducer",
      options: [
        "Online Search",
        "Friend/Colleague Recommendation",
        "Social Media",
        "Event/Conference",
      ],
      answer: "",
      placeholder: "Select how you knew about the application",
    },
    {
      question:
        "Have you had any previous experience with similar task management tools?",
      type: "pastExperience",
      options: ["Yes", "No"],
      answer: "",
      placeholder: "Select Yes or No",
    },
    {
      question:
        "Which task management system have you used in the last 2 years?",
      type: "havePastExperience",
      options: ["Jira", "Trello", "Google Calendar", "Teams Calendar"],
      answer: "",
      placeholder: "Select task management system(s) used in the last 2 years",
    },
    {
      question: "Which task management software are you currently using?",
      type: "currentlyUsing",
      options: ["Jira", "Trello", "Google Calendar", "Teams Calendar"],
      answer: "",
      placeholder: "Select current task management software(s)",
    },
  ];
  const steps = [
    {
      title: "Purpose",
      content: <AccessSelectionStep data={data} />,
    },
    // {
    //   title: "Name",
    //   content: <NamingStep />,
    // },
    {
      title: "Invite Your TeamMates",
      content: <InviteSection {...{ emails, setEmails }} />,
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    // textAlign: "center",
    color: token.colorTextTertiary,
    // backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    // border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
    padding: 30,
  };

  const updateOnboarding = async (data: any) => {
    const res = await userAPI.updateOnboardingUser(user.id, data);
    return res;
  };
  const formateData = (val: any) => {
    return data.map((d) => {
      return {
        ...d,
        answer: `${val[d.type]}`,
      };
    });
  };

  const onFinish = async (value: any) => {
    console.log("🚀 ~ file: namingSection.tsx:7 ~ onFinish ~ value:", value);
    setAccountName(value.account);
    let res: any;
    if (current === 0) {
      const formattedData = formateData(value);
      res = await updateOnboarding({
        index: current + 1,
        completed: true,
        data: formattedData,
      });
    } else {
      res = await updateOnboarding({
        index: current + 1,
        completed: true,
        emails: emails.toString(), // Doing this because backend wants this way
      });
      res && message.success("Onboarding successfull");
      res && dispatch(changeWorkspaceReloadStatusSlice());
    }
    res && setCurrent(current + 1);
  };
  const onFinishFailed = (value: any) => {
    console.log("🚀 ~ file: namingSection.tsx:7 ~ onFinish ~ value:", value);
    // setAccountName();
  };
  return (
    <Form
      name="basic"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      layout="vertical"
      // className="mx-auto w-60"
      requiredMark={false}
    >
      <div className="mt-[110px] ml-[96px] w-[560px]">
        {/* <div className="h-[70px]">
          {current > 0 && (
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => prev()}
              // htmlType="submit"
            >
              <PreviousIconSvg /> Back
            </div>
          )}
        </div> */}
        <Steps current={current} items={items} />
        <div style={contentStyle}>{steps[current]?.content}</div>
        <div style={{ marginTop: 24 }}>
          {current < steps.length - 1 && (
            <PrimaryButton htmlType="submit">Continue</PrimaryButton>
          )}
          {current === steps.length - 1 && (
            <PrimaryButton htmlType="submit">Done</PrimaryButton>
          )}
        </div>
        {current > 1 && (
          <div className="mx-auto mt-5 w-full p-5 text-lg font-semibold">
            Onboarding Completed
          </div>
        )}
      </div>
    </Form>
  );
};

export default OnboardingSteps;
