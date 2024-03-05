import { Form, message, Spin, Steps, theme } from "antd";
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
  const [loading, setLoading] = useState(false);

  const data: OnBoardingQuestionDto[] = [
    {
      question: "I am here for ",
      type: "purpose",
      options: [
        "Work",
        "Personal",
        "Project",
        "Client",
        "Freelance Work",
        "Team Collaboration",
        "Task Management",
        "Client Meetings",
        "Event Planning",
        "Research and Development",
      ],
      answer: "",
      placeholder: "What are you here for?",
    },
    {
      question: "I am working as a",
      type: "profession",
      options: [
        "Software Developer",
        "Project Manager",
        "Freelancer",
        "Graphic Designer",
        "Marketing Specialist",
        "Consultant",
        "Event Planner",
        "Researcher",
        "Client Services Representative",
        "Entrepreneur",
        "Other",
      ],
      answer: "",
      placeholder: "What do you do?",
    },
    {
      question: "Want to use it for ",
      type: "usingPurpose",
      options: [
        "Team Workload Analysis",
        "Project & Client Tracking",
        "Staff Scheduling",
        "Staff Payroll",
        "Task Management",
        "Freelance Projects",
        "Event Planning",
        "Research and Development",
        "Client Meetings",
        "Personal Productivity",
      ],
      answer: "",
      placeholder: "Select your role",
    },
    {
      question: "Where did you manage your task management?",
      type: "pastExperiences",
      options: [
        // Task Management
        "Jira",
        "Trello",
        "Google Calendar",
        "Teams Calendar",
        // Additional Task Management Tools
        "Asana",
        "ClickUp",
        "Monday.com",
        "Basecamp",
        "Todoist",
        "Notion",
        "Smartsheet",
        "Airtable",
        "Any.do",
        // Additional Calendar Management Tools
        "Outlook Calendar",
        "Apple Calendar",
        "Calendly",
        "Doodle",
        "Teamup",
        "None",
      ],
      answer: "",
      placeholder: "Select from these",
    },
  ];
  const steps = [
    {
      title: "Purpose",
      content: <AccessSelectionStep data={data} />,
    },
    {
      title: "Invite Your TeamMates",
      content: <InviteSection {...{ emails, setEmails }} />,
    },
  ];

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    color: token.colorTextTertiary,
    borderRadius: token.borderRadiusLG,
    marginTop: 16,
    // padding : 30,
  };

  const updateOnboarding = async (data: any) => {
    const res = await userAPI.updateOnboardingUser(user.id, data);
    return res;
  };
  const formateData = (val: any) => {
    return data.map((d) => {
      return {
        ...d,
        answer: `${val[d.type]}`, // Doing this because backend wants this way =>  array => string
      };
    });
  };

  const onFinish = async (value: any) => {
    setLoading(true);
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
      if (res) {
        message.success("Onboarding Successful");
        if (window.gtag) {
          window.gtag("event", "team_invite", {
            value: "team invitation",
          });
        }
        dispatch(changeWorkspaceReloadStatusSlice());
      }
    }
    res && setCurrent(current + 1);
    setLoading(false);
  };
  const onFinishFailed = (value: any) => {
    console.log("🚀 ~ file: namingSection.tsx:7 ~ onFinish ~ value:", value);
  };
  return (
    <div className="flex flex-col justify-center gap-12 p-20">
      <div className="flex flex-col gap-2">
        <div className="text-xl font-semibold">Hello {user.firstName}</div>
        <div>Let's start with some basic questions to get you started</div>
      </div>
      <Spin spinning={loading}>
        <Form
          name="basic"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="horizontal"
          requiredMark={false}
        >
          <div className="w-[560px]">
            <Steps current={current} items={items} />
            <div style={contentStyle} className="py-2">
              {steps[current]?.content}
            </div>
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
      </Spin>
    </div>
  );
};

export default OnboardingSteps;
