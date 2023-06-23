import { Button } from "antd";
import ImportedProjectsSection from "./components/importedProjectsSections";
import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import GlobalMOdal from "@/components/modals/globalModal";
import { useState } from "react";
import AddNewProject from "./components/addNewProject";

const ProjectImport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
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
      <ImportedProjectsSection />
      <GlobalMOdal
        {...{ isModalOpen, setIsModalOpen, title: "Add a New Project" }}
      >
        <AddNewProject />
      </GlobalMOdal>
    </div>
  );
};

export default ProjectImport;
