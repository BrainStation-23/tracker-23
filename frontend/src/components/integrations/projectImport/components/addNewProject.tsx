import { Button, Collapse } from "antd";
import { userAPI } from "APIs";
import { integrationName, IntegrationType } from "models/integration";
import { GroupProjects } from "models/projects";
import { Dispatch, SetStateAction, useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

import AddLocalProject from "./addLocalProject";
import AddProjectList from "./addProjectList";

const AddNewProject = ({
  groupProjects,
  setSpinning,
  setIsModalOpen,
}: {
  groupProjects: GroupProjects;
  setSpinning: Dispatch<SetStateAction<boolean>>;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [localProject, setLocalProject] = useState(false);

  return (
    <div className="flex w-full flex-col gap-3">
      <Collapse accordion={true}>
        {Object.keys(integrationName).map((type) => (
          <Collapse.Panel
            header={integrationName[type as IntegrationType]}
            key={`existing-integration-${type}`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-end">
                <Button
                  key={`new-integration-${type}`}
                  disabled={
                    integrationName[type as IntegrationType] ===
                    integrationName.TRELLO
                  }
                  className={
                    integrationName[type as IntegrationType] ===
                      integrationName.TRACKER23 && localProject
                      ? "bg-blue-300"
                      : ""
                  }
                  onClick={async () => {
                    try {
                      setSpinning(true);
                      if (
                        integrationName[type as IntegrationType] ===
                        integrationName.JIRA
                      ) {
                        const response = await userAPI.getJiraLink();
                        window.open(response, "_self");
                      } else if (
                        integrationName[type as IntegrationType] ===
                        integrationName.OUTLOOK
                      ) {
                        const response = await userAPI.getOutlookLink();
                        window.open(response, "_self");
                      } else if (
                        integrationName[type as IntegrationType] ===
                        integrationName.TRACKER23
                      ) {
                        setLocalProject(!localProject);
                      }
                      setSpinning(false);
                    } catch (error) {
                      console.log(
                        "🚀 ~ file: addNewProject.tsx:22 ~ onClick={ ~ error:",
                        error
                      );
                      setSpinning(false);
                    }
                  }}
                >
                  <div className="flex flex-shrink-0 gap-2 font-bold">
                    <PlusIconSvg stroke="#000000" />
                    {`Integrate new ${
                      integrationName[type as IntegrationType]
                    }`}
                  </div>
                </Button>
              </div>

              <AddProjectList
                importableProjects={groupProjects[
                  type as IntegrationType
                ].filter((project) => !project.integrated)}
                setSpinning={setSpinning}
              />
            </div>
          </Collapse.Panel>
        ))}
      </Collapse>

      {localProject && (
        <AddLocalProject
          closeDropdowns={() => setLocalProject(false)}
          setSpinning={setSpinning}
          setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default AddNewProject;
