import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { SyncOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { ProjectDto } from "models/projects";

type Props = {
  text?: string;
  type?: "text" | "link" | "ghost" | "default" | "primary" | "dashed";
  className?: string;
  onClick?: Function;
  project?: ProjectDto;
};

const SyncButtonComponent = ({
  text,
  type,
  onClick,
  className,
  project,
}: Props) => {
  const syncing = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );
  console.log("🚀 ~ file: syncButton.tsx:25 ~ syncing:", syncing);
  const syncingProjectId = useAppSelector(
    (state: RootState) => state.syncStatus.syncingProject
  );
  return (
    <Button
      type={type}
      className={`m-0 flex h-min items-center hover:bg-neutral-100 ${
        className ? className : " rounded-full p-1 text-primary hover:bg-white"
      }  ${
        (
          syncing && project && syncingProjectId
            ? syncingProjectId === project.id
            : syncing
        )
          ? "text-green-500"
          : ""
      }`}
      onClick={() => {
        onClick && onClick();
      }}
    >
      <SyncOutlined
        spin={
          syncing && project && syncingProjectId
            ? syncingProjectId === project.id
            : syncing
        }
      />
      {text && <div className="text-[15px] font-semibold">{text}</div>}
    </Button>
  );
};

export default SyncButtonComponent;
