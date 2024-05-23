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

  // ================================================
  // TODO: Code optimization
  const modifiedRows: ModifiesSprintReportUser[] = [];

  let rowKey: number = 0;
  let groupRowIndex: number = 0;
  let dateRowGroupIndex: number = 0;
  for(let record of data?.data ?? []) {
    let groupRows: number = 0;
    // Ahead of time calculation
    // groupRows
    record.users.forEach((user, _) => {
      const maxTasks = Math.max(
        Math.max(user.assignedTasks?.length, user.yesterdayTasks?.length),
        user?.todayTasks.length
      );
      groupRows += maxTasks > 0 ? maxTasks + 1 : 1;
    })
    
    groupRowIndex = 0;
    const dateCellStyle = dateRowGroupIndex % 2 === 0 ? rowColors[0] : rowColors[1];

    for(let userIndex = 0; userIndex < record.users.length; userIndex++){
      const maxTasks = Math.max(
        Math.max(record.users[userIndex].assignedTasks?.length, record.users[userIndex].yesterdayTasks?.length),
        record.users[userIndex]?.todayTasks.length
      );

      let userGroupRowIndex: number = 0;

      for(let i = 0; i < maxTasks + 1; i++){
        const tableRow: ModifiesSprintReportUser = {
          rowKey: rowKey,
          userId: record.users[userIndex].userId,
          name: record.users[userIndex].name,
          picture: record.users[userIndex].picture,
          devProgress: record.users[userIndex].devProgress,
          date: record.date,
          assignedTasks: record.users[userIndex].assignedTasks,
          yesterdayTasks: record.users[userIndex].yesterdayTasks,
          todayTasks: record.users[userIndex].todayTasks,
          sprintAssignedTasks: record.users[userIndex].assignedTasks,
          dateColSpan: i === 0 && userIndex === 0 ? groupRows : 0,
          style: colors[record.users[userIndex]?.userId],
          dateCellStyle: dateCellStyle,
          userSpan: i === 0 ? maxTasks > 0 ? maxTasks + 1 : 1 : 0,
          assignedTask: i === 0 ? null :  i-1 < record.users[userIndex].assignedTasks?.length ? record.users[userIndex].assignedTasks[i-1] : null,
          todayTask: i === 0 ? null :  i-1 < record.users[userIndex].todayTasks?.length ? record.users[userIndex].todayTasks[i-1] : null,
          yesterdayTask: i === 0 ? null :  i-1 < record.users[userIndex].yesterdayTasks?.length ? record.users[userIndex].yesterdayTasks[i-1] : null,
          groupRows: groupRows,
          groupRowIndex: groupRowIndex,
          userGroupRows: maxTasks > 0 ? maxTasks + 1 : 1,
          userGroupRowIndex: userGroupRowIndex,
        };
        
        rowKey = rowKey + 1;
        groupRowIndex = groupRowIndex + 1;
        userGroupRowIndex += 1;

        modifiedRows.push(tableRow);
      }
    }

    dateRowGroupIndex += 1;
  }
  // ================================================
  

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
      <SprintReportTabel data={modifiedRows} reportData={reportData} />
    </div>
  );
};

export default SprintReportComponent;
