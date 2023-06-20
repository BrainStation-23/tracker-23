import ImportedProjectsSection from "./components/importedProjectsSections";

const ProjectImport = () => {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-semibold">Select Source of Import</div>
        <ImportedProjectsSection />
      </div>
    </div>
  );
};

export default ProjectImport;
