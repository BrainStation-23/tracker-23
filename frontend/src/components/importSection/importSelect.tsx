import { Button } from "antd";
import { userAPI } from "APIs";
import { Integration } from "models/integration";
import { useState } from "react";
import { toast } from "react-toastify";
import { allIntegrations } from "utils/constants";

import ImportCard from "./importCard";

type Props = {
  integratedTypes: string[];
  integrations: Integration[];
  handleUninstallIntegration: Function;
  handleDeleteIntegration: Function;
  adminMode: boolean;
};

const ImportSelect = ({
  integratedTypes,
  integrations,
  handleUninstallIntegration,
  handleDeleteIntegration,
  adminMode,
}: Props) => {
  const [selected, setSelected] = useState("");
  return (
    <div className="mx-auto mt-32 flex w-min gap-4 p-4">
      {integrations?.map((d) => (
        <ImportCard
          key={Math.random()}
          data={d}
          selected={selected}
          adminMode={adminMode}
          setSelected={setSelected}
          handleUninstallIntegration={handleUninstallIntegration}
          handleDeleteIntegration={handleDeleteIntegration}
          installed={integratedTypes.includes(d.type)}
        />
      ))}
      {allIntegrations?.map(
        (d: string) =>
          !integratedTypes.includes(d) && (
            <ImportCard
              key={Math.random()}
              data={{ type: d as "JIRA" | "TRELLO" }}
              selected={selected}
              adminMode={adminMode}
              handleUninstallIntegration={handleUninstallIntegration}
              handleDeleteIntegration={handleDeleteIntegration}
              setSelected={setSelected}
              installed={integratedTypes.includes(d)}
            />
          )
      )}
    </div>
  );
};

export default ImportSelect;
