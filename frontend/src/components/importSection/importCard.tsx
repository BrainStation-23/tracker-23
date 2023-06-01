import { Button } from "antd";
import { userAPI } from "APIs";
import { Integration } from "models/integration";
import { useEffect } from "react";
import {
  IntegrationDescriptionsEnum,
  supportedIntegrations,
} from "utils/constants";

import JiraLogoFullSvg from "@/assets/svg/JiraFullLogoSvg";
import TrelloLogoSvg from "@/assets/svg/TrelloLogoSvg";

type Props = {
  data: Integration;
  selected: string;
  setSelected: Function;
  handleDeleteIntegration?: Function;
  installed?: boolean;
};

const ImportCard = ({
  data,
  selected,
  setSelected,
  handleDeleteIntegration,
  installed = false,
}: Props) => {
  useEffect(() => {}, []);

  return (
    <div
      className={`flex w-60 flex-col justify-between rounded-xl border-2 border-[#ECECED] p-4 hover:cursor-pointer`}
    >
      <div>
        <div className="flex h-10 items-center gap-2">
          {integrationIcons[data.type]}
        </div>
        {data.site ? (
          <div className="text-sm font-normal">
            Connected to
            <div
              className="text-sm font-normal text-blue-500"
              onClick={() => {
                window.open(data.site);
              }}
            >
              {data.site}
            </div>
          </div>
        ) : (
          <div className="text-sm font-normal">
            {IntegrationDescriptionsEnum[data.type as "JIRA"]}
          </div>
        )}
      </div>
      <div className="flex w-full pt-3">
        <Button
          onClick={async () => {
            if (data.type === "JIRA") {
              if (installed) {
                await handleDeleteIntegration(data.id);
              } else {
                try {
                  const response = await userAPI.getJiraLink();

                  window.open(response, "_self");
                } catch (error) {}
              }
            }
          }}
          type="default"
          disabled={!supportedIntegrations.includes(data.type)}
          // disabled={installed || !supportedIntegrations.includes(data.type)}
          className={`w-full cursor-pointer bg-[#F1F1F1] text-sm font-semibold
          ${
            installed || !supportedIntegrations.includes(data.type)
              ? ""
              : "hover:bg-[#d1d1d17f] hover:text-black"
          }
          `}
        >
          {installed
            ? "Uninstall"
            : // ? "Installed"
            supportedIntegrations.includes(data.type)
            ? "Install"
            : "Coming Soon"}
        </Button>
      </div>
    </div>
  );
};

export default ImportCard;

const integrationIcons: any = {
  JIRA: <JiraLogoFullSvg />,
  TRELLO: <TrelloLogoSvg />,
};
