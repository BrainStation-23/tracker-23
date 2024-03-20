import { message } from "antd";
import { userAPI } from "APIs";
import { SprintUser, UpdateReportDto } from "models/reports";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import UsersSelectorComponent from "@/components/common/topPanels/components/usersSelector";
import {
  ReportData,
  setReportInEditSlice,
  updateReportSlice,
} from "@/storage/redux/reportsSlice";

import TypeDependentSection from "../../typeDependentSection";
import ReportSettingsWrapper from "./reportSettingsWrapper";

type Props = {
  reportData: ReportData;
};
const SprintEstimationReportSettings = ({ reportData }: Props) => {
  const dispatch = useDispatch();
  const [users, setUsers] = useState<SprintUser[]>([]);
  const [sprints, setSprints] = useState<number[]>(
    reportData?.config?.sprintIds ? reportData?.config?.sprintIds : []
  );
  const [projects, setProjects] = useState<number[]>(
    reportData?.config?.projectIds ? reportData?.config?.projectIds : []
  );
  const [selectedUsers, setSelectedUsers] = useState<number[]>(
    reportData?.config?.userIds ? reportData?.config?.userIds : []
  );
  const getUserListByProject = async () => {
    const res = await userAPI.userListByProject(projects);
    res && setUsers(res);
  };

  const saveConfig = async (extraData?: UpdateReportDto) => {
    const res = await userAPI.updateReport(reportData.id, {
      sprintIds: sprints,
      userIds: selectedUsers,
      projectIds: projects,
      ...(extraData ?? {}),
    });
    if (res) {
      dispatch(updateReportSlice(res));
      message.success("Saved Successfully");
      dispatch(setReportInEditSlice(null));
    }
  };
  useEffect(() => {
    getUserListByProject();
  }, [projects]);
  return (
    <ReportSettingsWrapper
      {...{
        reportData,
        saveConfig,
      }}
    >
      <TypeDependentSection
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
    </ReportSettingsWrapper>
  );
};

export default SprintEstimationReportSettings;
