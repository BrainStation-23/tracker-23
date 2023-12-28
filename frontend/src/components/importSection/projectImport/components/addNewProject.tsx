import { Button } from "antd";
import { userAPI } from "APIs";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import AddLocalProject from "./addLocalProject";
import AddProjectList from "./addProjectList";
import { GroupProjects } from "models/projects";

const AddNewProject = ({
  groupProjects,
  setSpinning,
  setIsModalOpen,
}: {
  groupProjects: GroupProjects;
  setSpinning: Dispatch<SetStateAction<boolean>>;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [fromExistingSite, setFromExistingSite] = useState(false);
  const [localProject, setLocalProject] = useState(false);

  // TODO: We have to implement logic for all group (Integration) projects
  const importableProjects = groupProjects.JIRA.filter(
    (project: any) => !project.integrated
  );
  const closeDropdowns = () => {
    setLocalProject(false);
    setFromExistingSite(false);
  };
  console.log(
    "🚀 ~ file: addNewProject.tsx:12 ~ importableProjects:",
    importableProjects
  );
  useEffect(() => {}, [groupProjects]);
  return (
    <div className="flex flex-col gap-3">
      <Button
        onClick={async () => {
          try {
            setSpinning(true);
            const response = await userAPI.getJiraLink();

            window.open(response, "_self");
          } catch (error) {
            console.log(
              "🚀 ~ file: addNewProject.tsx:22 ~ onClick={ ~ error:",
              error
            );
            setSpinning(false);
          }
        }}
      >
        Import from new Site
      </Button>
      <Button onClick={() => setFromExistingSite(!fromExistingSite)}>
        Import from Existing Site
      </Button>
      {fromExistingSite && (
        <AddProjectList
          importableProjects={importableProjects}
          {...{ setSpinning }}
        />
      )}
      <Button onClick={() => setLocalProject(!localProject)}>
        Add Local Project
      </Button>

      {localProject && (
        <AddLocalProject {...{ setSpinning, setIsModalOpen, closeDropdowns }} />
      )}
    </div>
  );
};

export default AddNewProject;
