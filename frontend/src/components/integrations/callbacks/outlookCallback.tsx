import { message, Spin } from "antd";
import { userAPI } from "APIs";
import { ProjectDto } from "models/projects";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import GlobalModal from "@/components/modals/globalModal";

import NewIntegrationProjectImportComponent from "./components/newIntegrationProjectImport";
import { setIntegrationsSlice } from "@/storage/redux/integrationsSlice";
import { useAppDispatch } from "@/storage/redux";

// TODO: Refactor needed later
const OutlookCallBack = () => {
  const dispatch = useAppDispatch();
  
  const router = useRouter();
  const [newIntegrationProjects, setNewIntegrationProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    const res = await userAPI.sendOutlookCode(code);
    if (res && res[0]) {
      await getIntegrations(); // This needed to sync the integrations in the redux store
      setIsModalOpen(true);
      setNewIntegrationProjects(res);
    } else router.push("/projects");
  };

  const importIntegrationTasks = async (project: ProjectDto) => {
    setSpinning(true);
    const res = await userAPI.importCalendar([project.id]);
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
  }, [router.isReady]);
  const handleCancel = () => {
    router.push("/integrations");
  };
  let tip = "";
  if (router.query.code) tip = "Integrating Outlook";
  if (router.query.error) tip = "Cancelling Integration";
  return (
    <>
      <div className="flex w-full justify-center p-40">
        <Spin
          spinning={true}
          tip={tip}
          size="large"
          className="scale-150"
        ></Spin>
      </div>

      <GlobalModal
        {...{ isModalOpen, setIsModalOpen, handleCancel }}
        setQueryData={setQueryData}
        title="Select Calendar"
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

export default OutlookCallBack;
