import { Button, message, Spin } from "antd";
import { userAPI } from "APIs";
import { useEffect, useState } from "react";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import GlobalMOdal from "@/components/modals/globalModal";

import AddNewProject from "./components/addNewProject";
import ImportedProjectsSection from "./components/importedProjectsSections";

const ProjectImport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rootSpinning, setRootSpinning] = useState(false);
  const [allProjects, setAllProjects] = useState([]);

  const getAllProjects = async () => {
    const res = await userAPI.getAllProjects();
    console.log("🚀 ~ file: index.tsx:15 ~ getAllProjects ~ res:", res);
    if (res) setAllProjects(res);
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
      const tmp = allProjects?.map((p: any) =>
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
  useEffect(() => {}, [allProjects]);

  return (
    <Spin spinning={rootSpinning}>
      <div className="flex w-full flex-col gap-2">
        <div className="mb-4 flex justify-between">
          <h2 className="text-2xl font-bold">Imported Projects</h2>{" "}
          <Button
            type="primary"
            className="flex items-center gap-2 py-3 text-[15px] text-white"
            onClick={() => setIsModalOpen(true)}
          >
            <PlusIconSvg />
          </Button>
        </div>
        <ImportedProjectsSection {...{ allProjects, deleteProject }} />
        <GlobalMOdal
          {...{ isModalOpen, setIsModalOpen, title: "Add a New Project" }}
        >
          <Spin spinning={spinning} tip="Processing">
            <AddNewProject allProjects={allProjects} {...{ setSpinning }} />
          </Spin>
        </GlobalMOdal>
      </div>
    </Spin>
  );
};

export default ProjectImport;
