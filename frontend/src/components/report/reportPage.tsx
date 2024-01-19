import { userAPI } from "APIs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaChartBar } from "react-icons/fa";
import { FaChartGantt } from "react-icons/fa6";
import { LuGitCompare } from "react-icons/lu";
import { MdChecklist } from "react-icons/md";
import { useDispatch } from "react-redux";

import PlusIconSvg from "@/assets/svg/PlusIconSvg";
import { useAppSelector } from "@/storage/redux";
import {
  setReportProjectsSlice,
  setReportSprintListReducer,
} from "@/storage/redux/projectsSlice";
import {
  ReportData,
  setReportIntegrationTypesSlice,
  updateReportPageNameSlice,
} from "@/storage/redux/reportsSlice";
import { RootState } from "@/storage/redux/store";

import PrimaryButton from "../common/buttons/primaryButton";
import GlobalModal from "../modals/globalModal";
import AddNewReport from "./components/addNewReport";
import SprintEstimateReport from "./singleReports/sprintEstimateReport";
import SprintReport from "./singleReports/sprintReport";
import TaskListReport from "./singleReports/taskListReport";
import TimeSheetReport from "./singleReports/timeSheetReport";
import { IntegrationType } from "models/integration";
import { Form, Input } from "antd";
import { UpdateReportPageDto } from "models/reports";

const ReportPageComponent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const [form] = Form.useForm();
  const pageId = router.query?.reportPageId
    ? parseInt(router.query?.reportPageId as string)
    : -1;
  const [editing, setEditing] = useState(false);
  const reportPageData = useAppSelector(
    (state: RootState) => state.reportsSlice.reportPages
  ).find((reportPage) => reportPage.id === pageId);
  console.log("🚀 ~ ReportPageComponent ~ reportPageData:", reportPageData);
  const getSprintList = async () => {
    const res = await userAPI.getReportSprints();
    if (res?.length > 0) dispatch(setReportSprintListReducer(res));
  };
  const getIntegrationTypes = async () => {
    const res = await userAPI.getIntegrationTypesReportPage();
    console.log("🚀 ~ getIntegrationTypes ~ res:", res);
    if (res?.length > 0) {
      const types: IntegrationType[] = Array.from(
        new Set(res.map((type: any) => type.type))
      );
      console.log("🚀 ~ getIntegrationTypes ~ types:", types);
      dispatch(setReportIntegrationTypesSlice(types));
    }
  };

  const getProjectWiseStatues = async () => {
    {
      const res = await userAPI.getAllReportProjects();
      res && dispatch(setReportProjectsSlice(res));
    }
  };
  const reportToRender = (report: ReportData) => {
    switch (report.reportType) {
      case "TIME_SHEET":
        return <TimeSheetReport reportData={report} />;
      case "SPRINT_ESTIMATION":
        return <SprintEstimateReport reportData={report} />;
      case "TASK_LIST":
        return <TaskListReport reportData={report} />;
      case "SPRINT_REPORT":
        return <SprintReport reportData={report} />;
      default:
        return <div>No report found</div>;
    }
  };
  const updatePageName = async (data: UpdateReportPageDto) => {
    if (!reportPageData?.id) return;
    const res = await userAPI.updateReportPage(reportPageData.id, data);
    if (res) {
      console.log("🚀 ~ updatePageName ~ res:", res);
      dispatch(updateReportPageNameSlice(res));
    }
  };
  const onFinish = (values: { name: string }) => {
    if (values.name !== reportPageData.name) {
      updatePageName(values);
    }
    setEditing(false);
  };
  useEffect(() => {
    getIntegrationTypes();
    getSprintList();
    getProjectWiseStatues();
  }, []);
  return (
    <div className="flex flex-col gap-7 pb-5">
      <div className="flex items-center justify-between">
        {/* <div className="text-xl font-bold">{reportPageData?.name}</div>{" "} */}
        <div onClick={() => setEditing(true)}>
          {!editing ? (
            <div className="flex items-center gap-2 text-2xl font-bold">
              {/* {ReportIcons[reportData.reportType]} */}
              {reportPageData?.name}
            </div>
          ) : (
            <Form
              name="titleEdit"
              onFinish={onFinish}
              initialValues={{ name: reportPageData?.name }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  form.submit();
                }
                if (e.key === "Escape") {
                  setEditing(false);
                }
              }}
            >
              <div className="flex items-center gap-2 text-2xl font-semibold">
                {/* {ReportIcons[reportData.reportType]} */}
                <Form.Item
                  name="name"
                  className="m-0"
                  rules={[
                    { required: true, message: "Please input something!" },
                  ]}
                >
                  <Input
                    placeholder="Type something and press Enter"
                    className="m-0 p-0 px-1 text-2xl focus:shadow-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        form.submit();
                      }
                      if (e.key === "Escape") {
                        setEditing(false);
                      }
                    }}
                  />
                </Form.Item>
              </div>
            </Form>
          )}
        </div>
        <PrimaryButton onClick={() => setIsModalOpen(true)}>
          <PlusIconSvg /> Add New Report
        </PrimaryButton>
      </div>
      {reportPageData?.reports?.map((report) => {
        return (
          <div className="flex flex-col gap-5 rounded border-2 p-4">
            {reportToRender(report)}
          </div>
        );
      })}
      <GlobalModal title="Add New Report" {...{ isModalOpen, setIsModalOpen }}>
        <AddNewReport setIsModalOpen={setIsModalOpen} />
      </GlobalModal>
    </div>
  );
};

export default ReportPageComponent;

export const ReportIcons = {
  TIME_SHEET: <FaChartBar />,
  SPRINT_ESTIMATION: <LuGitCompare />,
  TASK_LIST: <MdChecklist />,
  SPRINT_REPORT: <FaChartGantt />,
};
