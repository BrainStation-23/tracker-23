import { message, Spin } from "antd";
import { userAPI } from "APIs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import GlobalMOdal from "@/components/modals/globalModal";
import IntegrationSelectionCard from "./component/integrationSelectionCard";

const JiraCallBack = () => {
  const router = useRouter();
  // const integrations = [
  //   {
  //     id: 29,
  //     site: "https://pm23.atlassian.net",
  //     siteId: "739f9088-50ef-4fe2-bbde-44f89c49917e",
  //     type: "JIRA",
  //     accessToken: "dsffdsf",
  //   },
  //   {
  //     id: 29,
  //     site: "https://pm23.atlassian.net",
  //     siteId: "739f9088-50ef-4fe2-bbde-44f89c49917e",
  //     type: "JIRA",
  //     accessToken: "dsffdsf",
  //   },
  // ];
  const [integrations, setIntegrations] = useState<any>();
  const [status, setStatus] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(true);

  const codeFound = async (code: string) => {
    const res = await userAPI.sendJiraCode(code);
    console.log("🚀 ~ file: callback.tsx:12 ~ codeFound ~ res:", res);
    if (res) {
      if (res?.length > 1) {
        setIntegrations([
          {
            id: 29,
            site: "https://pm23.atlassian.net",
            siteId: "739f9088-50ef-4fe2-bbde-44f89c49917e",
            type: "JIRA",
            accessToken: "dsffdsf",
          },
          {
            id: 29,
            site: "https://pm23.atlassian.net",
            siteId: "739f9088-50ef-4fe2-bbde-44f89c49917e",
            type: "JIRA",
            accessToken: "dsffdsf",
          },
        ]);
        setIsModalOpen(true);
      }

      message.success(res.message ? res.message : "Integration Successful");
      // router.push("/taskList");
    }
    // else router.push("/integrations");
  };

  useEffect(() => {
    const code = router.query.code;
    console.log("🚀 ~ file: callback.tsx:10 ~ useEffect ~ searchTerm:", code);
    if (typeof code === "string") codeFound(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (status) {
      // router.push("/home");
    }
  }, [router, status]);
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
        {...{ isModalOpen, setIsModalOpen }}
        title="Select Integration"
      >
        <div className="flex flex-col gap-6">
          <div>
            You have given access to multiple jira sites. Please select which
            one you want to integrate.
          </div>
          <div className="flex gap-4">
            {integrations?.map((d: any) => (
              <IntegrationSelectionCard
                key={Math.random()}
                data={d}
                // selected={selected}
                // setSelected={setSelected}
              />
            ))}
          </div>
        </div>
      </GlobalMOdal>
    </>
  );
};

export default JiraCallBack;
