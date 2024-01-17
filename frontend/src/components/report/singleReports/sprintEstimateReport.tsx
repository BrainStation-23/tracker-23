import { Button, message, Spin } from "antd";
import { userAPI } from "APIs";
import { SprintUser, SprintUserReportDto } from "models/reports";
import { useEffect, useState } from "react";
import { LuDownload } from "react-icons/lu";
import { useDispatch } from "react-redux";

import PrimaryButton from "@/components/common/buttons/primaryButton";
import UsersSelectorComponent from "@/components/common/topPanels/components/usersSelector";
import { ExcelExport } from "@/services/exportHelpers";
import { ReportData, updateReportSlice } from "@/storage/redux/reportsSlice";

import ReportHeaderComponent from "../components/reportHeaderComponent";
import SpritEstimateReportComponent from "../components/sprintEstimateReportComponent";
import TypeDependentSection from "../components/typeDependentSection";

type Props = {
  reportData: ReportData;
};
const SprintEstimateReport = ({ reportData }: Props) => {
  const dispatch = useDispatch();
  const [sprints, setSprints] = useState<number[]>(
    reportData?.config?.sprintIds ? reportData?.config?.sprintIds : []
  );
  const [sprintEstimateReportData, setSprintEstimateReportData] =
    useState<SprintUserReportDto>();
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ? reportData?.config?.projectIds : []
  );

  const [users, setUsers] = useState<SprintUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>(
    reportData?.config?.userIds ? reportData?.config?.userIds : []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const excelExport = async () => {
    setDownloading(true);
    try {
      const res = await userAPI.exportSprintReport({
        sprints,
        selectedUsers,
        projectIds: projects,
      });
      if (!res) {
        message.error(
          res?.error?.message ? res?.error?.message : "Export Failed"
        );
      } else {
        ExcelExport({ file: res, name: "Tracker 23 Sprint Report" });
      }
    } catch (error) {
      message.error("Export Failed");
    }
    setDownloading(false);
  };
  const saveConfig = async () => {
    const res = await userAPI.updateReport(reportData.id, {
      sprintIds: sprints,
      userIds: selectedUsers,
      projectIds: projects,
    });
    if (res) {
      dispatch(updateReportSlice(res));
      message.success("Saved Successfully");
    }
  };
  const getSprintUserReport = async () => {
    setIsLoading(true);
    const res: SprintUserReportDto = await userAPI.getSprintUserReport({
      sprints,
      selectedUsers,
      projectIds: projects,
    });
    res && setSprintEstimateReportData(res);
    setIsLoading(false);
  };
  const getUserListByProject = async () => {
    const res = await userAPI.userListByProject(projects);
    res && setUsers(res);
  };

  useEffect(() => {
    getSprintUserReport();
  }, [sprints, selectedUsers, projects]);

  useEffect(() => {
    getUserListByProject();
  }, [projects]);
  return (
    <>
      <ReportHeaderComponent
        title={reportData.name}
        reportData={reportData}
        setIsLoading={setIsLoading}
        exportButton={
          <Button
            type="ghost"
            className="flex items-center gap-2 rounded-md bg-[#016C37] py-4 text-white hover:bg-[#1d8b56] hover:text-white"
            icon={<LuDownload className="text-xl" />}
            loading={downloading}
            onClick={() => excelExport()}
          >
            Export to Excel
          </Button>
        }
        saveCofigButton={
          <PrimaryButton onClick={() => saveConfig()}> Save</PrimaryButton>
        }
      >
        <>
          <TypeDependentSection
            config={reportData?.config}
            {...{
              activeTab: "Sprint Estimate",
              projects,
              setProjects,
              sprints,
              setSprints,
            }}
          />

          <UsersSelectorComponent
            {...{ userList: users, selectedUsers, setSelectedUsers }}
            className="w-[210px]"
          />
        </>
      </ReportHeaderComponent>
      <Spin className="custom-spin" spinning={isLoading}>
        <SpritEstimateReportComponent data={sprintEstimateReportData} />
      </Spin>
    </>
  );
};

export default SprintEstimateReport;
