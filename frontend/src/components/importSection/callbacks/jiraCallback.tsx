import { message, Spin } from "antd";
import { userAPI } from "APIs";
import { Integration } from "models/integration";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import GlobalMOdal from "@/components/modals/globalModal";

import IntegrationSelectionCard from "./components/integrationSelectionCard";

const JiraCallBack = () => {
  const router = useRouter();
  const [integrations, setIntegrations] = useState<Integration[]>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(true);
  const [isModalSpinning, setIsModalSpinning] = useState(false);

  const codeFound = async (code: string) => {
    const res = await userAPI.sendJiraCode(code);
    if (res) {
      if (res?.length > 1) {
        setIntegrations(res);
        setIsModalOpen(true);
      } else {
        message.success(res.message ? res.message : "Integration Successful");
        router.push("/taskList");
      }
    } else router.push("/integrations");
  };

  useEffect(() => {
    const code = router.query.code;
    if (typeof code === "string") codeFound(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);
  const handleCancel = () => {
    router.push("/integrations");
  };
  return (
    <>
      <div className="flex w-full justify-center p-40">
        <Spin
          spinning={isSpinning}
          tip="Integrating Jira"
          size="large"
          className="scale-150"
        ></Spin>
      </div>
      <GlobalMOdal
        {...{ isModalOpen, setIsModalOpen, handleCancel }}
        title="Select Integration"
      >
        <Spin spinning={isModalSpinning} className="flex flex-col gap-6">
          <div>
            You have given access to multiple jira sites. Please select which
            one you want to integrate.
          </div>
          <div className="flex gap-4">
            {integrations?.map((integration: any) => (
              <IntegrationSelectionCard
                key={Math.random()}
                integration={integration}
                setIsModalSpinning={setIsModalSpinning}
              />
            ))}
          </div>
        </Spin>
      </GlobalMOdal>
    </>
  );
};

export default JiraCallBack;
