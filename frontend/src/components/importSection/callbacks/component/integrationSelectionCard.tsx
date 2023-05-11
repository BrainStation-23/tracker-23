import { Button } from "antd";
import { Integration } from "models/integration";
import { useEffect } from "react";

import JiraLogoFullSvg from "@/assets/svg/JiraFullLogoSvg";
import TrelloLogoSvg from "@/assets/svg/TrelloLogoSvg";

type Props = {
  data: Integration;
};

const IntegrationSelectionCard = ({ data }: Props) => {
  console.log("🚀 ~ file: IntegrationSelectionCard.tsx:19 ~ data:", data);

  useEffect(() => {}, []);

  return (
    <div
      className={`flex w-60 flex-col justify-between rounded-xl border-2 border-[#ECECED] p-4 hover:cursor-pointer`}
    >
      <div>
        <div className="flex h-10 items-center gap-2">
          {integrationIcons[data.type]}
        </div>
        <div className="text-sm font-normal">
          Connect to
          <div
            className="text-sm font-normal text-blue-500"
            onClick={() => {
              window.open(data.site);
            }}
          >
            {data.site}
          </div>
        </div>
      </div>
      <div className="flex w-full pt-3">
        <Button
          onClick={async () => {}}
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
