import { message, Spin } from "antd";
import { userAPI } from "APIs";
import { IntegrationType } from "models/integration";
import { ProjectDto } from "models/projects";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import GlobalModal from "@/components/modals/globalModal";

import NewIntegrationProjectImportComponent from "./components/newIntegrationProjectImport";
import { useAppDispatch } from "@/storage/redux";
import { setIntegrationsSlice } from "@/storage/redux/integrationsSlice";

const JiraCallBack = () => {
  const dispatch = useAppDispatch();

  const router = useRouter();
  const [newIntegrationProjects, setNewIntegrationProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpinning] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [queryData, setQueryData] = useState("");
  
  const getIntegrations = async () => {
    setSpinning(true);
    const integrations = await userAPI.getIntegrations();
    if (integrations) {
      dispatch(setIntegrationsSlice(integrations));
    }
    setSpinning(false);
  };

  const codeFound = async (code: string) => {
    const res = await userAPI.sendJiraCode(code);

    if (res && res[0]) {
      await getIntegrations(); // This needed to sync the integrations in the redux store
      setIsModalOpen(true);
      // TODO: We should do this step in Backend API to keep consistent response for all kinds of integrations responses
      const jiraProjects = res
        .map(
          (tmp: {
            projects: ProjectDto[];
            integrationType: IntegrationType;
          }) => {
            return tmp.projects.map((project: ProjectDto) => {
              return { ...project, integrationType: res.integrationType };
            });
          }
        )
        .flat();
      setNewIntegrationProjects(jiraProjects);
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

      <GlobalModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        handleCancel={handleCancel}
        search={true}
        setQueryData={setQueryData}
        title="Select Project"
      >
        <Spin spinning={spinning}>
          <NewIntegrationProjectImportComponent
          newIntegrationProjects={newIntegrationProjects}
          importIntegrationTasks={importIntegrationTasks}
          queryData={queryData}
          />
        </Spin>
      </GlobalModal>
    </>
  );
};

export default JiraCallBack;
