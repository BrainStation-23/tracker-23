import { userAPI } from "APIs";
import { message, Spin } from "antd";
import { useEffect, useState } from "react";
import { GroupProjects, ProjectDto } from "models/projects";
import { integrationName, IntegrationType } from "models/integration";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";

import GlobalModal from "@/components/modals/globalModal";
import PrimaryButton from "@/components/common/buttons/primaryButton";
import AddNewProject from "@/components/integrations/projectImport/addNewProject";
import ImportedProjectsSection from "@/components/integrations/projectImport/importedProjectsSections";

const ProjectPage = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rootSpinning, setRootSpinning] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [groupProjects, setAllProjects] = useState<GroupProjects>({
    JIRA: [],
    TRELLO: [],
    OUTLOOK: [],
    TRACKER23: [],
    AZURE_DEVOPS: []
  });
  const [searchGroupProjects, setSearchGroupProjects] = useState<GroupProjects>(
    {
      JIRA: [],
      TRELLO: [],
      OUTLOOK: [],
      TRACKER23: [],
      AZURE_DEVOPS: []
    }
  );

  const searchProject = (
    query: string,
    integrationName: "JIRA" | "TRELLO" | "OUTLOOK" | "TRACKER23"
  ) => {
    const specificValue: ProjectDto[] = groupProjects[integrationName] || [];
    const filteredProjects: ProjectDto[] = specificValue.filter((project) =>
      project.projectName.toLowerCase().includes(query.toLowerCase())
    );
    const updatedGroupProjects = {
      ...groupProjects,
      [integrationName]: filteredProjects,
    };
    setSearchGroupProjects(updatedGroupProjects);
  };

  const syncAllProjects = async () => {
    setIsSyncing(true);
    try {
      const res = await userAPI.syncAllProjects();
      const groupProjects: GroupProjects = {
        JIRA: [],
        TRELLO: [],
        OUTLOOK: [],
        TRACKER23: [],
        AZURE_DEVOPS: []
      };
      if (Array.isArray(res)) {
        res.forEach((project: ProjectDto) => {
          const integrationType = project.integrationType;
          if (groupProjects[integrationType]) {
            groupProjects[integrationType].push(project);
          } else {
            console.warn(`Unknown integration type: ${integrationType}`);
          }
        });
        setSearchGroupProjects(groupProjects);
        setAllProjects(groupProjects);
      } else {
        console.error("Unexpected response format:", res);
      }
      setInitialLoadDone(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsSyncing(false);
    }
  };
  const getAllProjects = async () => {
    const res = await userAPI.getAllProjects();
    if (res) {
      const groupProjects: GroupProjects = {
        JIRA: [],
        TRELLO: [],
        OUTLOOK: [],
        TRACKER23: [],
        AZURE_DEVOPS: []
      };
      res.forEach((project: ProjectDto) => {
        groupProjects[project.integrationType].push(project);
      });
      setSearchGroupProjects(groupProjects);
      setAllProjects(groupProjects);
      setInitialLoadDone(true);
    }
  };

  const deleteProject = async (project: ProjectDto) => {
    setRootSpinning(true);
    const res = await userAPI.deleteProjectTasks(project.id);
    if (res) {
      message.success(res.message);
      const tmp = {
        ...groupProjects,
        [project.integrationType]:
          project.integrationType === "TRACKER23"
            ? groupProjects[project.integrationType].filter(
                (p: ProjectDto) => p.id != project.id
              )
            : groupProjects[project.integrationType].map((p: ProjectDto) =>
                p.id != project.id ? p : { ...p, integrated: false }
              ),
      };
      setSearchGroupProjects(tmp);
      setAllProjects(tmp);
    }
    setRootSpinning(false);
  };

  useEffect(() => {
    getAllProjects();
  }, [spinning]);

  return (
    <Spin spinning={rootSpinning}>
      <div className="mb-12 flex w-full flex-col gap-4 px-8 pt-4">
        <div className="mb-4 flex justify-between">
          <h2 className="text-2xl font-bold">Your Projects and Calenders</h2>
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            <PlusIconSvg /> Add New
          </PrimaryButton>
        </div>
        {initialLoadDone ? (
          <div className="flex w-full flex-col gap-12">
            {Object.keys(integrationName).map((type) => (
              <ImportedProjectsSection
                key={type}
                title={integrationName[type as IntegrationType]}
                deleteProject={deleteProject}
                projects={groupProjects[type as IntegrationType].filter(
                  (project) => project.integrated
                )}
              />
            ))}
          </div>
        ) : (
          <Spin spinning={true}></Spin>
        )}
        <GlobalModal
          width={720}
          {...{
            isModalOpen,
            setIsModalOpen,
            title: "Add a new Project or Calender",
          }}
        >
          <Spin spinning={spinning} tip="Processing">
            <AddNewProject
              groupProjects={searchGroupProjects}
              setSpinning={setSpinning}
              setIsModalOpen={setIsModalOpen}
              syncAllProjects={syncAllProjects}
              isSyncing={isSyncing}
              searchProject={searchProject}
            />
          </Spin>
        </GlobalModal>
      </div>
    </Spin>
  );
};

export default ProjectPage;
