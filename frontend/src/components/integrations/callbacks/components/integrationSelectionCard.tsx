import { Button } from "antd";
import { userAPI } from "APIs";
import { IntegrationDto } from "models/integration";
import { useRouter } from "next/router";

import JiraLogoFullSvg from "@/assets/svg/JiraFullLogoSvg";
import TrelloLogoSvg from "@/assets/svg/TrelloLogoSvg";
import OpenLinkInNewTab from "@/components/common/link/OpenLinkInNewTab";

type Props = {
  integration: IntegrationDto;
  setIsModalSpinning: Function;
};

const IntegrationSelectionCard = ({
  integration,
  setIsModalSpinning,
}: Props) => {
  const router = useRouter();
  const handleSelectIntegration = async (id: string) => {
    setIsModalSpinning(true);
    const res = await userAPI.selectJiraIntegration(id);
    if (res) router.push("/taskList");
    else router.push("/integrations");
  };

  return (
    <div
      className={`flex w-60 flex-col justify-between rounded-xl border-2 border-[#ECECED] p-4 hover:cursor-pointer`}
    >
      <div>
        <div className="flex h-10 items-center gap-2">
          {integrationIcons[integration.type]}
        </div>
        <div className="text-sm font-normal">
          Connect to
          <OpenLinkInNewTab
            className="text-sm font-normal text-blue-500"
            onClick={() => {
              window.open(integration.site);
            }}
          >
            {integration.site}
          </OpenLinkInNewTab>
        </div>
      </div>
      <div className="flex w-full pt-3">
        <Button
          onClick={() => {
            handleSelectIntegration(integration.siteId);
          }}
          type="default"
          className={`w-full cursor-pointer bg-[#F1F1F1] text-sm font-semibold
          hover:bg-[#d1d1d17f] hover:text-black`}
        >
          Select
        </Button>
      </div>
    </div>
  );
};

export default IntegrationSelectionCard;

const integrationIcons: any = {
  JIRA: <JiraLogoFullSvg />,
  TRELLO: <TrelloLogoSvg />,
};
