import { message, Spin } from "antd";
import { userAPI } from "APIs";
import { Integration } from "models/integration";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import GlobalMOdal from "@/components/modals/globalModal";

import IntegrationSelectionCard from "./components/integrationSelectionCard";
import { useDispatch } from "react-redux";
import { setSyncRunning } from "@/storage/redux/syncSlice";

const JiraCallBack = () => {
  const dispatch = useDispatch();
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
        dispatch(setSyncRunning(true));
        router.push("/taskList");
      }
    } else router.push("/integrations");
  };

  useEffect(() => {
    const code = router.query.code;
    if (typeof code === "string") codeFound(code);
    if (router.query.error) router.push("/integrations");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);
  const handleCancel = () => {
    router.push("/integrations");
  };
  let tip = "";
  if (router.query.code) tip = "Integrating Jira";
  if (router.query.error) tip = "Cancelling Integration";
  return (
    <>
      <div className="flex w-full justify-center p-40">
        <Spin
          spinning={isSpinning}
          tip={tip}
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
