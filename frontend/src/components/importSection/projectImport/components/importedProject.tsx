import { ProjectDto } from "models/projects";

import DeleteButton from "@/components/common/buttons/deleteButton";
import SyncButtonComponent from "@/components/common/buttons/syncButton";
import { useDispatch } from "react-redux";
import {
  setSyncRunning,
  setSyncStatus,
  setSyncingProjectReducer,
} from "@/storage/redux/syncSlice";
import { userAPI } from "APIs";
import { message } from "antd";
import OpenLinkInNewTab from "@/components/common/link/OpenLinkInNewTab";
import { integrationName } from "models/integration";
import { outlookSourceUrl } from "utils/constants";

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
    <div className="flex w-[500px] justify-between rounded-md border-2 p-3 hover:bg-gray-50">
      <div className="flex flex-col">
        <div className=" font-bold">{project.projectName}</div>
        <div className="flex items-center gap-1">
          <div> Source :</div>
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
      <div className="flex items-center">
        {project.source != "T23" && (
          <SyncButtonComponent
            project={project}
            onClick={() => syncProject()}
          />
        )}
        <DeleteButton
          onClick={() => {
            deleteProjectTasks();
          }}
        />
      </div>
    </div>
  );
};

export default ImportedProject;
