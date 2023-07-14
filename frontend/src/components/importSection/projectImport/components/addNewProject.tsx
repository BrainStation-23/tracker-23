import { Button } from "antd";
import AddProjectList from "./addProjectList";
import { useEffect, useState } from "react";
import { userAPI } from "APIs";

const AddNewProject = ({ allProjects, setSpinning }: any) => {
  const [fromExistingSite, setFromExistingSite] = useState(false);

  const importableProjects = allProjects.filter(
    (project: any) => !project.integrated
  );
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
      </Button>{" "}
      <Button onClick={() => setFromExistingSite(!fromExistingSite)}>
        Add from Existing Site
      </Button>
      {fromExistingSite && (
        <AddProjectList
          importableProjects={importableProjects}
          {...{ setSpinning }}
        />
      )}
    </div>
  );
};

export default AddNewProject;
