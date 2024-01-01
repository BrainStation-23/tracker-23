import { Button } from "antd";
import { userAPI } from "APIs";
import {
  Integration,
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

import DeleteButton from "../common/buttons/deleteButton";
import OpenLinkInNewTab from "../common/link/OpenLinkInNewTab";

type Props = {
  data: Integration;
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
    <div
      className={`relative flex w-60 flex-col justify-between rounded-xl border-2 border-[#ECECED] p-4`}
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
                window.open(data.site);
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
            } else if (data.type === "OUTLOOK") {
              // TODO: Refactor needed later
              if (installed) {
                await handleUninstallIntegration(data.id);
              } else {
                try {
                  const response = await userAPI.getOutlookLink();

                  window.open(response, "_self");
                  console.log("response", response);

                  // https://login.microsoftonline.com/common/oauth2/v2.0/authorize?&scope=offline_access user.read Calendars.ReadWrite Calendars.Read&response_type=code&response_mode=query&state=testing&redirect_uri=http://localhost:3001/integrations/outlook/callback/&client_id=872cd7ddadkasj-430c-bcc3-9ee4d568cdfb&prompt=consent
                } catch (error) {
                  console.log("OUTLOOK getOutlookLink error:", error);
                }
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

export const integrationIcons: any = {
  JIRA: <JiraIconSvg />,
  TRELLO: <TrelloLogoSvg />,
  OUTLOOK: <OutlookLogoSvg />,
};
