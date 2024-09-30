import { Button, Collapse, Spin, Tooltip } from "antd";
import { userAPI } from "APIs";
import { integrationName, IntegrationType } from "models/integration";
import { GroupProjects } from "models/projects";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SyncOutlined } from "@ant-design/icons";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

import AddLocalProject from "./addLocalProject";
import AddProjectList from "./addProjectList";

const AddNewProject = ({
  groupProjects,
  setSpinning,
  setIsModalOpen,
  syncAllProjects,
  isSyncing,
  searchProject,
}: {
  groupProjects: GroupProjects;
  setSpinning: Dispatch<SetStateAction<boolean>>;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  isSyncing: boolean;
  syncAllProjects: () => Promise<void>;
  searchProject: (
    query: string,
    integrationName: "JIRA" | "TRELLO" | "OUTLOOK" | "TRACKER23"
  ) => void;
}) => {
  const [localProject, setLocalProject] = useState(false);
  const [queryData, setQueryData] = useState("");

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (queryData) {
        searchProject(queryData, "JIRA");
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [queryData, searchProject]);

  return (
    <div className="flex w-full flex-col gap-3">
      <Collapse accordion={true}>
        {Object.keys(integrationName).map((type) => (
          <Collapse.Panel
            header={integrationName[type as IntegrationType]}
            key={`existing-integration-${type}`}
          >
            <div className="flex flex-col gap-4">
              <div className="flex justify-around">
                <div>
                  {integrationName[type as IntegrationType] !==
                  integrationName.TRACKER23 ? (
                    isSyncing ||
                    integrationName[type as IntegrationType] ===
                      integrationName.TRELLO ? (
                      <input
                        key={`new-integration-${type}`}
                        disabled
                        type="text"
                        placeholder="Search..."
                        value={queryData}
                        onChange={(e) => setQueryData(e.target.value)}
                        className="w-full rounded-md border p-2 cursor-not-allowed focus:border-gray-300 focus:outline-none focus:ring"
                      />
                    ) : (
                      <input
                        key={`new-integration-${type}`}
                        type="text"
                        placeholder="Search..."
                        value={queryData}
                        onChange={(e) => setQueryData(e.target.value)}
                        className="w-full rounded-md border p-2 focus:border-gray-300 focus:outline-none focus:ring"
                      />
                    )
                  ) : (
                    <></>
                  )}
                </div>
                <div className="flex ">
                  <div>
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
                  <div className="pl-8">
                    {integrationName[type as IntegrationType] !==
                    integrationName.TRACKER23 ? (
                      isSyncing ||
                      integrationName[type as IntegrationType] ===
                        integrationName.TRELLO ? (
                        <button
                          key={`new-integration-${type}`}
                          disabled
                          className="ant-btn css-dev-only-do-not-override-mzwlov ant-btn-default flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full bg-gray-200 text-black shadow-lg focus:outline-none"
                        >
                          <SyncOutlined spin={isSyncing} className="text-sm" />
                        </button>
                      ) : (
                        <Tooltip title="Sync">
                          <button
                            key={`new-integration-${type}`}
                            onClick={syncAllProjects}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-black shadow-lg hover:bg-gray-300 focus:outline-none"
                          >
                            <SyncOutlined className="text-sm" />
                          </button>
                        </Tooltip>
                      )
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
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
