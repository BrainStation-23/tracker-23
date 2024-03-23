import { ModifiesSprintReportUser, SprintReportDto } from "models/reports";
import { colorPairs, rowColors } from "utils/constants";

import ProgressComponent from "./progressComponent";
import SprintReportTabel from "./sprintReportTable";
import { ReportData } from "@/storage/redux/reportsSlice";

type Props = {
  data: SprintReportDto;
  reportData: ReportData;
};

const SprintReportComponent = ({ data, reportData }: Props) => {
  const userList = data ? [...data?.data[0]?.users] : [];
  const colors: any = {};
  userList.map((user, index) => {
    colors[user.userId] = {
      ...colorPairs[index],
    };
  });

  const modifiedData: ModifiesSprintReportUser[] = data?.data?.flatMap(
    (record, index2) => {
      const len = record.users.length;

      const devidedUptoUser: any = record.users.map((user, index: any) => ({
        ...user,
        key: user.userId,
        date: record.date,
        name: user.name,
        sprintAssignedTasks: user.assignedTasks,
        yesterdayTasks: user.yesterdayTasks,
        todayTasks: user.todayTasks,
        dateColSpan: index > 0 ? 0 : len,
        style: colors[user?.userId],
        dateCellStyle: index2 % 2 === 0 ? rowColors[0] : rowColors[1],
      }));

      const devidedUptoTasks: any = [];
      for (let d of devidedUptoUser) {
        const mx = Math.max(
          Math.max(d.assignedTasks?.length, d.yesterdayTasks?.length),
          d?.todayTasks.length
        );
        devidedUptoTasks.push({
          ...d,
          userSpan: mx + 1,
          assignedTask: null,
          todayTask: null,
          yesterdayTask: null,
        });
        for (let i = 0; i < mx; i++) {
          devidedUptoTasks.push({
            ...d,
            userSpan: 0,
            assignedTask: d.assignedTasks[i],
            todayTask: d.todayTasks[i],
            yesterdayTask: d.yesterdayTasks[i],
          });
        }
      }
      const addedDateColSpan = [];

      const dateSpans: any = {};

      for (let d of devidedUptoTasks) {
        let dateSpan = 0;
        if (typeof dateSpans[d.date] !== "number") {
          const filteredUsers = devidedUptoTasks.filter(
            (t: any) => t.date === d.date && d.userSpan > 0
          );
          for (let tt of filteredUsers) dateSpan += tt.userSpan;
          dateSpans[d.date] = dateSpan;
        }
        addedDateColSpan.push({ ...d, dateColSpan: dateSpan });
      }
      return addedDateColSpan;
    }
  );
  return (
    <div className="flex w-full flex-col gap-5">
      {typeof data?.sprintInfo?.total === "number" && (
        <div className="flex items-center gap-1 py-2">
          <div className="w-[110px] font-semibold"> Sprint Progress </div>
          <ProgressComponent
            done={data?.sprintInfo?.done}
            total={data?.sprintInfo?.total}
          />
        </div>
      )}
      <SprintReportTabel data={modifiedData} reportData={reportData} />
    </div>
  );
};

export default SprintReportComponent;
