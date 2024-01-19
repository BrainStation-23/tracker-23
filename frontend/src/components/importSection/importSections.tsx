import { IntegrationDto } from "models/integration";

import ImportCard from "./importCard";

type Props = {
  title: string;
  adminMode: boolean;
  integrations: IntegrationDto[];
  handleUninstallIntegration: Function;
  handleDeleteIntegration: Function;
  installed?: boolean;
};
const IntegrationCard = ({
  title,
  integrations,
  adminMode,
  handleUninstallIntegration,
  handleDeleteIntegration,
  installed,
}: Props) => {
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="text-xl font-bold">{title}</div>
      <div className="flex w-min gap-4">
        {integrations?.map((d) => (
          <ImportCard
            key={Math.random()}
            data={d}
            adminMode={adminMode}
            handleUninstallIntegration={handleUninstallIntegration}
            handleDeleteIntegration={handleDeleteIntegration}
            installed={installed}
          />
        ))}
      </div>
    </div>
  );
};

export default IntegrationCard;
