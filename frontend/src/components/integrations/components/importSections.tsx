import { IntegrationDto } from "models/integration";

import ImportCard from "./importCard";
import { Card } from "antd";

type Props = {
  title: string;
  adminMode: boolean;
  installed?: boolean;
  integrations: IntegrationDto[];
  handleDeleteIntegration: Function;
  handleUninstallIntegration: Function;
};
const IntegrationCard = ({
  title,
  adminMode,
  installed,
  integrations,
  handleDeleteIntegration,
  handleUninstallIntegration,
}: Props) => {
  return (
    <Card
      style={{
        backgroundColor: "#F5F5F5",
      }}
    >
      <div className="flex w-full flex-col gap-4 ">
        <div className="text-xl font-bold">{title}</div>
        <div className="flex justify-around flex-wrap gap-y-4">
          {integrations?.map((d) => (
            <ImportCard
              data={d}
              key={Math.random()}
              adminMode={adminMode}
              installed={installed}
              handleDeleteIntegration={handleDeleteIntegration}
              handleUninstallIntegration={handleUninstallIntegration}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default IntegrationCard;
