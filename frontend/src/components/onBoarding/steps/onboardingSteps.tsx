import React, { useState } from "react";
import { Button, Form, message, Steps, theme } from "antd";
import PurposeStep from "./components/purpose";
import NamingStep from "./components/namingSection";
import PreviousIconSvg from "@/assets/svg/PreviousIconSvg";
import InviteSection from "./components/inviteSection";

const OnboardingSteps: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [accountName, setAccountName] = useState(null);
  const steps = [
    {
      title: "Purpose",
      content: <PurposeStep />,
    },
    {
      title: "Name",
      content: <NamingStep />,
    },
    {
      title: "Invite Your TeamMates",
      content: <InviteSection />,
    },
  ];
  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

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
  const onFinish = (value: any) => {
    console.log("🚀 ~ file: namingSection.tsx:7 ~ onFinish ~ value:", value);
    setAccountName(value.account);
    setCurrent(current + 1);
  };
  const onFinishFailed = (value: any) => {
    console.log("🚀 ~ file: namingSection.tsx:7 ~ onFinish ~ value:", value);
    // setAccountName();
  };
  return (
    <Form
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
      // className="mx-auto w-60"
    >
      <div className="mt-[110px] ml-[96px] w-[560px]">
        <div className="h-[70px]">
          {current > 0 && (
            <div
              className="flex cursor-pointer items-center gap-2"
              onClick={() => prev()}
              // htmlType="submit"
            >
              <PreviousIconSvg /> Back
            </div>
          )}
        </div>
        <Steps current={current} items={items} />
        <div style={contentStyle}>{steps[current].content}</div>
        <div style={{ marginTop: 24 }}>
          {current < steps.length - 1 && (
            <Button type="primary" htmlType="submit">
              Continue
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button
              type="primary"
              onClick={() => message.success("Processing complete!")}
            >
              Done
            </Button>
          )}
        </div>
      </div>
    </Form>
  );
};

export default OnboardingSteps;
