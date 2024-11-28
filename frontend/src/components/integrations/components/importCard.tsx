import { Button, Card } from "antd";
import { userAPI } from "APIs";
import {
  IntegrationDto,
  integrationName,
  IntegrationType,
} from "models/integration";
import { useEffect } from "react";
import {
  IntegrationDescriptionsEnum,
  supportedIntegrations,
} from "utils/constants";

import JiraIconSvg from "@/assets/svg/JiraIconSvg";
import OutlookLogoSvg from "@/assets/svg/OutlookLogoSvg";
import TrelloLogoSvg from "@/assets/svg/TrelloLogoSvg";
import DeleteButton from "@/components/common/buttons/deleteButton";
import OpenLinkInNewTab from "@/components/common/link/OpenLinkInNewTab";
import Image from "next/image";
import Icon from "@/assets/images/icon.png";

type Props = {
  data: IntegrationDto;
  handleUninstallIntegration?: Function;
  handleDeleteIntegration?: Function;
  installed?: boolean;
  adminMode?: boolean;
};

const ImportCard = ({
  data,
  handleUninstallIntegration,
  handleDeleteIntegration,
  installed = false,
  adminMode,
}: Props) => {
  useEffect(() => {}, []);

  return (
    <Card
      hoverable
      className={`relative flex w-96 flex-col justify-between hover:cursor-default  md:w-72`}
    >
      <div>
        {data.site && adminMode && (
          <DeleteButton
            className="absolute right-2"
            onClick={async () => {
              await handleDeleteIntegration(data.id);
            }}
          />
        )}
        <div className="flex h-10 items-center gap-2">
          {integrationIcons[data.type]}
          <div className="text-xl font-bold">{integrationName[data.type]}</div>
        </div>
        {data.site ? (
          <div className="text-sm font-normal">
            Connected to{" "}
            <OpenLinkInNewTab
              onClick={() => {
                window.open(
                  data.type === "OUTLOOK"
                    ? "https://outlook.office.com/mail/"
                    : data.site
                );
              }}
            >
              {data.site}
            </OpenLinkInNewTab>
          </div>
        ) : (
          <div className="text-sm font-normal">
            {IntegrationDescriptionsEnum[data.type as IntegrationType]}
          </div>
        )}
      </div>
      <div className="flex w-full pt-3">
        <Button
          onClick={async () => {
            if (data.type === "JIRA") {
              if (installed) {
                await handleUninstallIntegration(data.id);
              } else {
                try {
                  const response = await userAPI.getJiraLink();
                  window.open(response, "_self");
                } catch (error) {}
              }
            } else if (data.type === "AZURE_DEVOPS") {
              if (installed) {
                await handleUninstallIntegration(data.id);
              } else {
                try {
                  const response = await userAPI.getAzureDevopsLink();
                  window.open(response, "_self");
                } catch (error) {}
              }
            } else if (data.type === "OUTLOOK") {
              if (installed) {
                await handleUninstallIntegration(data.id);
              } else {
                try {
                  const response = await userAPI.getOutlookLink();
                  window.open(response, "_self");
                } catch (error) {
                  console.log("OUTLOOK getOutlookLink error:", error);
                }
              }
            }
          }}
          type="default"
          disabled={!supportedIntegrations.includes(data.type)}
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
            : supportedIntegrations.includes(data.type)
            ? "Install"
            : "Coming Soon"}
        </Button>
      </div>
    </Card>
  );
};

export default ImportCard;

export const integrationIcons: any = {
  JIRA: <JiraIconSvg />,
  TRELLO: <TrelloLogoSvg />,
  OUTLOOK: <OutlookLogoSvg />,
  TRACKER23: <Image alt="tracker 23 icon" src={Icon} height={20} width={20} />,
};
