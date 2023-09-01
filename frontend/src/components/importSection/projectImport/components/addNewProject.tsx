import { Button } from "antd";
import { userAPI } from "APIs";
import { useEffect, useState } from "react";

import AddLocalProject from "./addLocalProject";
import AddProjectList from "./addProjectList";

const AddNewProject = ({ allProjects, setSpinning, setIsModalOpen }: any) => {
  const [fromExistingSite, setFromExistingSite] = useState(false);
  const [localProject, setLocalProject] = useState(false);

  const importableProjects = allProjects.filter(
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
  useEffect(() => {}, [allProjects]);
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
        Add from new Site
      </Button>
      <Button onClick={() => setFromExistingSite(!fromExistingSite)}>
        Add from Existing Site
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
