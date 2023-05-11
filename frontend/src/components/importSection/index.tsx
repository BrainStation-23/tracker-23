import { Spin } from "antd";
import { userAPI } from "APIs";
import { Integration } from "models/integration";
import { useEffect, useState } from "react";

import ImportSelect from "./importSelect";

const ImportSection = () => {
  const [integratedTypes, setIntegratedTypes] = useState<string[] | null>(null);
  const [integrations, setIntegrations] = useState<Integration[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTip, setLoadingTip] = useState("");

  const getIntegrations = async () => {
    setLoading(true);
    const tmp: string[] = [];
    const integrations = await userAPI.getIntegrations();
    console.log(
      "🚀 ~ file: index.tsx:29 ~ getIntegrations ~ integrations:",
      integrations
    );
    if (integrations) {
      setIntegrations(integrations);
      integrations?.forEach((i: any) => {
        tmp.push(i.type);
      });
      setIntegratedTypes(tmp);
    }
    setLoading(false);
  };
  const handleDeleteIntegration = async (id: number) => {
    setLoadingTip("Deleting Integration");
    setLoading(true);
    const res = await userAPI.deleteIntegration(id);
    getIntegrations();
    setLoading(false);
    setLoadingTip("");
  };

  useEffect(() => {
    getIntegrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log(integratedTypes);

  return (
    <Spin spinning={loading} tip={loadingTip}>
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-col gap-2">
          {integratedTypes && (
            <ImportSelect
              {...{ integratedTypes, integrations, handleDeleteIntegration }}
            />
          )}
        </div>
        {/* <IntegratedServices {...{ data }} /> */}
        {/* <div className="flex justify-end">
        <Button type="link">Skip ...</Button>{" "}
      </div> */}
        {/* <Button onClick={() => handleOnclick()}>jira link</Button> */}
      </div>
    </Spin>
  );
};

export default ImportSection;
