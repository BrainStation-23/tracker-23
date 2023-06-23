import ImportProject from "./importProject";

const AddProjectList = () => {
  const allProjectList = [
    { projectName: "Project A", source: "jira" },
    { projectName: "Project B", source: "github" },
    { projectName: "Project C", source: "bitbucket" },
    { projectName: "Project D", source: "gitlab" },
    { projectName: "Project E", source: "jira" },
    { projectName: "Project F", source: "github" },
  ];
  return (
    <div className="m-3 flex max-h-[300px] flex-col gap-2 overflow-y-auto">
      {allProjectList?.map((project) => {
        return (
          <ImportProject
            projectName={project.projectName}
            source={project.source}
          />
        );
      })}
    </div>
  );
};

export default AddProjectList;
