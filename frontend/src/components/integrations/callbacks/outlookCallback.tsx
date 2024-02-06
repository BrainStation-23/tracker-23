import { message, Spin } from "antd";
import { userAPI } from "APIs";
import { ProjectDto } from "models/projects";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import GlobalModal from "@/components/modals/globalModal";

import NewIntegrationProjectImportComponent from "./components/newIntegrationProjectImport";

// TODO: Refactor needed later
const OutlookCallBack = () => {
  const router = useRouter();
  const [newIntegrationProjects, setNewIntegrationProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(true);
  const [spinning, setSpinning] = useState(false);

  const codeFound = async (code: string) => {
    const res = await userAPI.sendOutlookCode(code);
    console.log("sendOutlookCode", res);

    if (res && res[0]) {
      setIsModalOpen(true);
      setNewIntegrationProjects(res);
    } else router.push("/projects");
  };

  const importIntegrationTasks = async (project: ProjectDto) => {
    setSpinning(true);
    const res = await userAPI.importCalendar([project.id]);
    console.log("importProject", res);

    if (res) {
      message.success(res.message);
      router.push("/projects");
      setIsModalOpen(false);
    }
    setSpinning(false);
  };

  useEffect(() => {
    const code = router.query.code;
    console.log(`importing ${code}`);
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
          spinning={isSpinning}
          tip={tip}
          size="large"
          className="scale-150"
        ></Spin>
      </div>

      <GlobalModal
        {...{ isModalOpen, setIsModalOpen, handleCancel }}
        title="Select Calendar"
      >
        <Spin spinning={spinning}>
          <NewIntegrationProjectImportComponent
            newIntegrationProjects={newIntegrationProjects}
            importIntegrationTasks={importIntegrationTasks}
          />
        </Spin>
      </GlobalModal>
    </>
  );
};

export default OutlookCallBack;
