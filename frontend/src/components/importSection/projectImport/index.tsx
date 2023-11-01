import { message, Spin } from "antd";
import { userAPI } from "APIs";
import { useEffect, useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import PrimaryButton from "@/components/common/buttons/primaryButton";
import GlobalModal from "@/components/modals/globalModal";

import AddNewProject from "./components/addNewProject";
import ImportedProjectsSection from "./components/importedProjectsSections";

const ProjectImport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rootSpinning, setRootSpinning] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  const getAllProjects = async () => {
    const res = await userAPI.getAllProjects();
    console.log("🚀 ~ file: index.tsx:15 ~ getAllProjects ~ res:", res);
    if (res) setAllProjects(res);
    setInitialLoadDone(true);
  };

  const deleteProject = async (project: any) => {
    setRootSpinning(true);
    const res = await userAPI.deleteProjectTasks(project.id);
    console.log(
      "🚀 ~ file: importProject.tsx:12 ~ deleteProjectTasks ~ res:",
      res
    );
    if (res) {
      message.success(res.message);
      const tmp =
        project.source === "T23"
          ? allProjects?.filter((p: any) => p.id != project.id)
          : allProjects?.map((p: any) =>
              p.id != project.id ? p : { ...p, integrated: false }
            );
      console.log("🚀 ~ file: index.tsx:35 ~ deleteProject ~ tmp:", tmp);
      setAllProjects(tmp);
    }

    setRootSpinning(false);
  };

  useEffect(() => {
    getAllProjects();
  }, [spinning]);
  useEffect(() => {}, [allProjects, initialLoadDone]);

  return (
    <Spin spinning={rootSpinning}>
      <div className="flex w-full flex-col gap-2">
        <div className="mb-4 flex justify-between">
          <h2 className="text-2xl font-bold">Your Projects</h2>
          <PrimaryButton onClick={() => setIsModalOpen(true)}>
            <PlusIconSvg /> Add Project
          </PrimaryButton>
        </div>
        {initialLoadDone ? (
          <ImportedProjectsSection {...{ allProjects, deleteProject }} />
        ) : (
          <Spin spinning={true}></Spin>
        )}
        <GlobalModal
          width={600}
          {...{ isModalOpen, setIsModalOpen, title: "Add a New Project" }}
        >
          <Spin spinning={spinning} tip="Processing">
            <AddNewProject
              allProjects={allProjects}
              {...{ setSpinning, setIsModalOpen }}
            />
          </Spin>
        </GlobalModal>
      </div>
    </Spin>
  );
};

export default ProjectImport;
