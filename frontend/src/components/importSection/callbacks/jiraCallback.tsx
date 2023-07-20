import { message, Spin } from "antd";
import { userAPI } from "APIs";
import { ProjectDto } from "models/projects";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import GlobalMOdal from "@/components/modals/globalModal";

import NewIntegrationProjectImportComponent from "./components/newIntegrationProjectImport";

const JiraCallBack = () => {
  const router = useRouter();
  const [newIntegrationProjects, setNewIntegrationProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinning, setSpinning] = useState(false);

  const codeFound = async (code: string) => {
    const res = await userAPI.sendJiraCode(code);

    if (res && res[0]) {
      setIsModalOpen(true);
      setNewIntegrationProjects(res);
    } else router.push("/projects");
  };

  const importIntegrationTasks = async (project: ProjectDto) => {
    setSpinning(true);
    const res = await userAPI.importProject(project.id);
    if (res) {
      message.success(res.message);
      router.push("/projects");
      setIsModalOpen(false);
    }
    setSpinning(false);
  };

  useEffect(() => {
    const code = router.query.code;
    if (typeof code === "string") codeFound(code);
    if (router.query.error) router.push("/projects");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);
  const handleCancel = () => {
    router.push("/integrations");
  };
  let tip = "";
  if (router.query.code) tip = "Integrating Jira";
  if (router.query.error) tip = "Cancelling Integration";
  return (
    <>
      <div className="flex w-full justify-center p-40">
        <Spin
          spinning={isSpinning}
          tip={tip}
          size="large"
          className="scale-150"
        ></Spin>
      </div>

      <GlobalMOdal
        {...{ isModalOpen, setIsModalOpen, handleCancel }}
        title="Select Project"
      >
        <Spin spinning={spinning}>
          <NewIntegrationProjectImportComponent
            {...{
              newIntegrationProjects,
              importIntegrationTasks,
            }}
          />
        </Spin>
      </GlobalMOdal>
    </>
  );
};

export default JiraCallBack;
