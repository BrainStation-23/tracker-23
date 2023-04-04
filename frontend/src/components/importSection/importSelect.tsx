import { Button } from "antd";
import { userAPI } from "APIs";
import { useState } from "react";
import { toast } from "react-toastify";
import ImportCard from "./importCard";

type Props = {
  importCardData: any;
  integratedTypes: string[];
};

const ImportSelect = ({ importCardData, integratedTypes }: Props) => {
  const [selected, setSelected] = useState("");
  return (
    <div className="flex flex-col gap-2">
      <div className="text-2xl font-semibold">Select Source of Import</div>
      <div className="mx-auto mt-32 flex w-min gap-4 p-4">
        {importCardData?.map((d: any) => (
          <ImportCard
            key={Math.random()}
            data={d}
            selected={selected}
            setSelected={setSelected}
            installed={integratedTypes.includes(d.type)}
          />
        ))}
      </div>
      {/* <Button
        className="mx-auto w-52"
        onClick={async () => {
          if (selected === "Jira Software") {
            const res = await userAPI.authJira();
            console.log("🚀 ~ file: index.tsx:41 ~ onClick={ ~ res:", res);
          } else toast.error(`Sorry ${selected} import is not supported`);
        }}
      >
        {selected.length > 0 ? "Import from " + selected : "Select"}{" "}
      </Button> */}
    </div>
  );
};

export default ImportSelect;
