import { Integration, IntegrationType } from "models/integration";
import { useState } from "react";
import { allIntegrations } from "utils/constants";

import IntegrationCard from "./importSections";

type Props = {
  integrations: Integration[];
  handleUninstallIntegration: Function;
  handleDeleteIntegration: Function;
  adminMode: boolean;
};

const ImportSelect = ({
  integrations,
  handleUninstallIntegration,
  handleDeleteIntegration,
  adminMode,
}: Props) => {
  return (
    <div className="flex w-full flex-col gap-12 p-4">
      <IntegrationCard
        title="Installed"
        {...{
          integrations,
          adminMode,
          handleUninstallIntegration,
          handleDeleteIntegration,
          installed: true,
        }}
      />
      <IntegrationCard
        title="Install New"
        {...{
          integrations: allIntegrations?.map((d: string) => ({
            type: d as IntegrationType,
          })),
          adminMode,
          handleUninstallIntegration,
          handleDeleteIntegration,
        }}
      />
    </div>
  );
};

export default ImportSelect;
