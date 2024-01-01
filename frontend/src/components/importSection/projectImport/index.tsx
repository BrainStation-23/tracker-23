import { message, Spin } from "antd";
import { userAPI } from "APIs";
import { useEffect, useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import PrimaryButton from "@/components/common/buttons/primaryButton";
import GlobalModal from "@/components/modals/globalModal";

import AddNewProject from "./components/addNewProject";
import ImportedProjectsSection from "./components/importedProjectsSections";
import { GroupProjects, ProjectDto } from "models/projects";
import { IntegrationType, integrationName } from "models/integration";

const ProjectImport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rootSpinning, setRootSpinning] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [groupProjects, setAllProjects] = useState<GroupProjects>({
    JIRA: [],
    TRELLO: [],
    OUTLOOK: [],
    TRACKER23: [],
  });

  const getAllProjects = async () => {
    const res = await userAPI.getAllProjects();
    console.log("🚀 ~ file: index.tsx:15 ~ getAllProjects ~ res:", res);
    if (res) {
      const groupProjects: GroupProjects = {
        JIRA: [],
        TRELLO: [],
        OUTLOOK: [],
        TRACKER23: [],
      };
      res.forEach((project: ProjectDto) => {
        groupProjects[project.integrationType].push(project);
      });

      setAllProjects(groupProjects);
      setInitialLoadDone(true);
    }
  };

  const deleteProject = async (project: ProjectDto) => {
    setRootSpinning(true);
    const res = await userAPI.deleteProjectTasks(project.id);
    console.log(
      "🚀 ~ file: importProject.tsx:12 ~ deleteProjectTasks ~ res:",
      res
    );
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
      console.log("🚀 ~ file: index.tsx:35 ~ deleteProject ~ tmp:", tmp);
      setAllProjects(tmp);
    }

    setRootSpinning(false);
  };

  useEffect(() => {
    getAllProjects();
  }, [spinning]);
  useEffect(() => {}, [groupProjects, initialLoadDone]);

  return (
    <Spin spinning={rootSpinning}>
      <div className="mb-12 flex w-full flex-col gap-4">
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
              groupProjects={groupProjects}
              setSpinning={setSpinning}
              setIsModalOpen={setIsModalOpen}
            />
          </Spin>
        </GlobalModal>
      </div>
    </Spin>
  );
};

export default ProjectImport;
