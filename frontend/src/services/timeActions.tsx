import dayjs from "dayjs";
import { monthsList } from "utils/constants";

export const getFormattedTotalTime = (time: number) => {
  if (!time) return null;
  let tmp = time;
  tmp = Math.round(tmp / 1000);
  const seconds = tmp % 60;
  tmp = Math.floor(tmp / 60);
  const mins = tmp % 60;
  tmp = Math.floor(tmp / 60);
  if (mins + tmp === 0)
    return `${seconds ? seconds + " s" : ""}
    `;
  return `${tmp ? tmp + "hrs " : ""}${mins ? mins + "m" : ""}
  `;
  // ${
  //   seconds ?? seconds + "s"
  // }
};
export const formatDate = (time: any) => (time ? new Date(time) : null);
export const getFormattedTime = (timestamp: any) => {
  // or use padStart
  const date = timestamp;
  let hours = date?.getHours(),
    minutes = date?.getMinutes(),
    seconds = date?.getSeconds(),
    day = date?.getDate(),
    month = date?.getMonth(),
    year = date?.getFullYear();
  let time = "am";
  let zeroM = "";
  let zeroH = "";
  if (hours === 0) hours = 12;
  else if (hours > 12) {
    hours -= 12;
    time = "pm";
  }
  if (minutes < 10) zeroM = "0";
  if (hours < 10) zeroH = "0";
  return (
    // zeroH +
    // hours +
    // ":" +
    // zeroM +
    // minutes +
    // time +
    // ", " +
    monthsList[month] + " " + day + "," + " " + year
  );
  // return (
  //   hours + ":" + minutes + ":" + seconds + " " + day + "/" + month + "/" + year
  // );
};
export const getFormattedShortTime = (timestamp: any) => {
  // or use padStart
  const date = timestamp;
  let hours = date?.getHours(),
    minutes = date?.getMinutes(),
    seconds = date?.getSeconds(),
    day = date?.getDate(),
    month = date?.getMonth(),
    year = date?.getFullYear();
  let time = "am";
  let zeroM = "";
  let zeroH = "";
  if (hours === 0) hours = 12;
  else if (hours > 12) {
    hours -= 12;
    time = "pm";
  }
  if (minutes < 10) zeroM = "0";
  if (hours < 10) zeroH = "0";
  return (
    hours + ":" + zeroM + minutes + " " + time
    // +
    // ", " +
    // monthsList[month] + " " + day + "," + " " + year
  );
  // return (
  //   hours + ":" + minutes + ":" + seconds + " " + day + "/" + month + "/" + year
  // );
};
export const getTotalSpentTime = (sessions: any) => {
  let total: number = 0;
  sessions?.forEach((session: any) => {
    if (session.endTime) {
      const startTime: any = new Date(session.startTime);
      const endTime: any = new Date(session.endTime);
      total += endTime - startTime;
    } else {
      const startTime: any = new Date(session.startTime);
      const endTime: any = new Date();
      total += endTime - startTime;
    }
  });

  if (!sessions || sessions?.length === 0) return 0;
  else return total;
};

export const getHourFromMinutes = (min: number) => {
  if (!min) return 0;
  const hour = Number((min / 60).toFixed(2));
  return hour;
};

export const getDayWithMonth = (date: any) => {
  return dayjs(date).format("D MMMM");
};
