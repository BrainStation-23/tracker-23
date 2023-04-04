import { Button, Image } from "antd";
import { userAPI } from "APIs";
import { useEffect } from "react";
import { supportedIntegrations } from "utils/constants";

const ImportCard = ({
  data,
  selected,
  setSelected,
  installed = false,
}: any) => {
  console.log("🚀 ~ file: importCard.tsx:5 ~ ImportCard ~ selected:", selected);
  useEffect(() => {}, []);

  return (
    <div
      className={`flex w-60 flex-col justify-between rounded-xl border-2 border-[#ECECED] p-4 grayscale hover:cursor-pointer ${
        data.type === "JIRA" ? "grayscale-0" : "grayscale"
      }`}
    >
      <div>
        <div className="flex h-10 items-center gap-2">
          <Image
            height={data.full ? 60 : 15}
            width={data.full ? 100 : 15}
            preview={false}
            src={`/assets/images/${data.logo}`}
            alt="Error Loading Image"
          />
          {data.full ? "" : data.title}
        </div>
        <div className="text-sm font-normal">{data.description}</div>
      </div>
      <div className="flex w-full pt-3">
        <Button
          onClick={async () => {
            // setSelected(data.title);
            if (data.type === "JIRA") {
              try {
                const response = await userAPI.getJiraLink();
                console.log(
                  "🚀 ~ file: index.tsx:26 ~ handleOnclick ~ response:",
                  response
                );
                window.open(response, "_self");
              } catch (error) {}
            }
          }}
          type="default"
          disabled={installed || !supportedIntegrations.includes(data.type)}
          className={`w-full 
          cursor-pointer
          bg-[#F1F1F1]
          text-sm
          font-semibold
          ${
            installed || !supportedIntegrations.includes(data.type)
              ? ""
              : "hover:bg-[#d1d1d17f] hover:text-black"
          }
          `}
        >
          {installed
            ? "Installed"
            : supportedIntegrations.includes(data.type)
            ? "Install"
            : "Coming Soon"}
        </Button>
      </div>
    </div>
  );
};

export default ImportCard;
