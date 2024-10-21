import React from "react";
import ScrumReportTabel from "./scrumReportTable";
import { colorPairs, rowColors } from "utils/constants";

type Props = {
  data: {
    date: string | Date;
    resData: any;
  };
  reportData: any;
};

const ScrumReportComponent = ({ data, reportData }: Props) => {
  const userList: any[] = [];
  const colors: any = {};
  userList.map((user, index) => {
    colors[user.userId] = {
      ...colorPairs[index],
    };
  });

  const modifiedRows: any[] = [];

  let rowKey: number = 0;
  let groupRowIndex: number = 0;
  let dateRowGroupIndex: number = 0;
  for (let record of data?.resData ?? []) {
    let groupRows: number = 0;
    const maxTasks = Math.max(
      Math.max(record.tasks.length, record.todayTasks.length),
      record.yesterdayTasks.length
    );
    groupRows = maxTasks > 0 ? maxTasks + 1 : 1;

    groupRowIndex = 0;
    const dateCellStyle =
      dateRowGroupIndex % 2 === 0 ? rowColors[0] : rowColors[1];

    let userGroupRowIndex: number = 0;
    let spentHours = 0;
    let estimationHours = 0;

    for (let i = 0; i < maxTasks; i++) {
      estimationHours +=
        i < record.todayTasks?.length ? parseFloat(record.todayTasks[i].estimation) : 0;
      spentHours +=
        i < record.yesterdayTasks?.length
          ? record.yesterdayTasks[i].spentHours
          : 0;

      const tableRow: any = {
        rowKey: rowKey,
        name: record.user.firstName + " " + record.user.lastName,
        estimationHours: estimationHours,
        spentHours: spentHours,
        assignedTasks: record.tasks,
        yesterdayTasks: record.yesterdayTasks,
        todayTasks: record.todayTasks,
        style: colors[record.user?.id],
        dateCellStyle: dateCellStyle,
        userSpan: i === 0 ? (maxTasks > 0 ? maxTasks + 1 : 1) : 0,
        assignedTask: i < record.tasks?.length ? record.tasks[i] : null,
        todayTask: i < record.todayTasks?.length ? record.todayTasks[i] : null,
        yesterdayTask:
          i < record.yesterdayTasks?.length ? record.yesterdayTasks[i] : null,
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
    dateRowGroupIndex += 1;
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <ScrumReportTabel
        date={data?.date}
        data={modifiedRows}
        reportData={reportData}
      />
    </div>
  );
};

export default ScrumReportComponent;
