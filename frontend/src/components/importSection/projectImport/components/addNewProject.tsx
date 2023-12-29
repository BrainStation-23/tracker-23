import { Button, Collapse } from "antd";
import { userAPI } from "APIs";
import { GroupProjects } from "models/projects";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

import AddLocalProject from "./addLocalProject";
import AddProjectList from "./addProjectList";
import { integrationName, IntegrationType } from "models/integration";

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
      <Collapse defaultActiveKey={["existing-integration"]} accordion={true}>
        <Collapse.Panel
          header="Import from new Integration"
          key="new-integration"
        >
          <div className="flex gap-4">
            {Object.keys(integrationName).map((type) => (
              <Button
                key={`new-integration-${type}`}
                disabled={
                  integrationName[type as IntegrationType] ===
                  integrationName.TRELLO
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
                      const response = await userAPI.getJiraLink();
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
                {integrationName[type as IntegrationType]}
              </Button>
            ))}
          </div>
        </Collapse.Panel>
        <Collapse.Panel
          header="Import from existing Integration"
          key="existing-integration"
        >
          <Collapse accordion={true}>
            {Object.keys(integrationName).map((type) => (
              <Collapse.Panel
                header={integrationName[type as IntegrationType]}
                key={`existing-integration-${type}`}
              >
                <AddProjectList
                  importableProjects={groupProjects[
                    type as IntegrationType
                  ].filter((project) => !project.integrated)}
                  setSpinning={setSpinning}
                />
              </Collapse.Panel>
            ))}
          </Collapse>
        </Collapse.Panel>
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
