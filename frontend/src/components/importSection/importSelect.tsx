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
  handleDeleteIntegration: Function;
};

const ImportSelect = ({
  integratedTypes,
  integrations,
  handleDeleteIntegration,
}: Props) => {
  const [selected, setSelected] = useState("");
  return (
    <div className="mx-auto mt-32 flex w-min gap-4 p-4">
      {integrations?.map((d) => (
        <ImportCard
          key={Math.random()}
          data={d}
          selected={selected}
          setSelected={setSelected}
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
