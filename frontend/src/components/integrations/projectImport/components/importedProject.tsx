import { Card, message } from "antd";
import { userAPI } from "APIs";
import { integrationName } from "models/integration";
import { ProjectDto } from "models/projects";
import { useDispatch } from "react-redux";
import { outlookSourceUrl } from "utils/constants";

import DeleteButton from "@/components/common/buttons/deleteButton";
import SyncButtonComponent from "@/components/common/buttons/syncButton";
import OpenLinkInNewTab from "@/components/common/link/OpenLinkInNewTab";
import {
  setSyncingProjectReducer,
  setSyncRunning,
  setSyncStatus,
} from "@/storage/redux/syncSlice";

type Props = {
  project: ProjectDto;
  deleteProject: Function;
};
const ImportedProject = ({ project, deleteProject }: Props) => {
  const dispatch = useDispatch();
  const deleteProjectTasks = async () => {
    deleteProject(project);
  };
  const syncProject = async () => {
    if (!project.id) {
      message.error("Invalid Project ID");
      return;
    }
    dispatch(setSyncRunning(true));
    dispatch(setSyncingProjectReducer(project.id));

    const res = await userAPI.syncProjectTasks(project.id);
    res && dispatch(setSyncStatus(res));
  };
  return (
    <Card hoverable className="w-1/3 hover:cursor-default">
      <div className="flex w-full flex-col justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="font-bold">{project.projectName}</div>
          <div className="text-sm font-medium">
            Source:{" "}
            <OpenLinkInNewTab
              onClick={() => {
                integrationName[project.integrationType] ===
                  integrationName.JIRA && window.open(project.source);
                integrationName[project.integrationType] ===
                  integrationName.OUTLOOK && window.open(outlookSourceUrl);
              }}
            >
              {project.source}
            </OpenLinkInNewTab>
          </div>
        </div>
        <div className="flex items-center justify-between gap-8">
          {project.source != "T23" && (
            <SyncButtonComponent project={project} onClick={syncProject} />
          )}
          <DeleteButton
            onClick={() => {
              deleteProjectTasks();
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default ImportedProject;
