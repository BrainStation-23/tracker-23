import { Image } from "antd";
import { userAPI } from "APIs";
import { useEffect } from "react";

const ImportCard = ({ data, selected, setSelected }: any) => {
  console.log("🚀 ~ file: importCard.tsx:5 ~ ImportCard ~ selected:", selected);
  useEffect(() => {}, []);

  return (
    <div
      className={`w-40 rounded border-2 border-blue-600 p-2 grayscale hover:cursor-pointer ${
        data.type === "JIRA" ? "grayscale-0" : "grayscale"
      }`}
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
    >
      <div className="flex h-10 items-center justify-center gap-2">
        <Image
          height={data.full ? 60 : 15}
          width={data.full ? 100 : 15}
          preview={false}
          src={`/assets/images/${data.logo}`}
          alt="Error Loading Image"
        />
        {data.full ? "" : data.title}
      </div>
    </div>
  );
};

export default ImportCard;
