import { IntegrationDto } from "models/integration";

import ImportCard from "./importCard";
import { Card } from "antd";

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
    <Card
      style={{
        backgroundColor: "#F5F5F5",
      }}
    >
      <div className="flex w-full flex-col gap-4 ">
        <div className="text-xl font-bold">{title}</div>
        <div className="flex flex-wrap gap-4">
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
    </Card>
  );
};

export default IntegrationCard;
