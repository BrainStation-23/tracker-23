import { Button } from "antd";
import AddProjectList from "./addProjectList";
import { useState } from "react";

const AddNewProject = () => {
  const [fromExistingSite, setFromExistingSite] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <Button>Add from new Site</Button>{" "}
      <Button onClick={() => setFromExistingSite(!fromExistingSite)}>
        Add from Existing Site
      </Button>
      {fromExistingSite && <AddProjectList />}
    </div>
  );
};

export default AddNewProject;
