import { useEffect, useState } from "react";

import { Button } from "antd";
import ImportSelect from "./importSelect";
import { userAPI } from "APIs";
import { importCardData } from "utils/constants";

const ImportSection = () => {
  const [integratedTypes, setIntegratedTypes] = useState([]);

  const handleOnclick = async () => {
    try {
      const response = await userAPI.getJiraLink();
      console.log(
        "🚀 ~ file: index.tsx:26 ~ handleOnclick ~ response:",
        response
      );
      window.open(response, "_self");
    } catch (error) {}
  };

  const getIntegrations = async () => {
    if (integratedTypes.length <= 0) {
      const tmp: string[] = [];
      const integrations = await userAPI.getIntegrations();
      if (integrations) {
        integrations.forEach((i: any) => tmp.push(i.type));
        setIntegratedTypes(tmp);
      }
    }
  };

  useEffect(() => {
    getIntegrations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  console.log(integratedTypes);

  return (
    <div className="flex w-full flex-col gap-2">
      <ImportSelect {...{ importCardData, integratedTypes }} />

      {/* <IntegratedServices {...{ data }} /> */}
      {/* <div className="flex justify-end">
        <Button type="link">Skip ...</Button>{" "}
      </div> */}
      {/* <Button onClick={() => handleOnclick()}>jira link</Button> */}
    </div>
  );
};

export default ImportSection;
