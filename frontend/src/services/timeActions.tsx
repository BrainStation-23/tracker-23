import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { monthsList } from "utils/constants";

// Extend Day.js with the relativeTime plugin
dayjs.extend(relativeTime);
export const getFormattedTotalTime = (time: number) => {
  if (time === 0) return "0 m";
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
  return `${mins < 0 ? "- " : ""}${tmp ? Math.abs(tmp) + "hrs " : ""}${
    mins ? Math.abs(mins) + "m" : ""
  }
  `;
};
export const formatDate = (time: any) => (time ? new Date(time) : null);
export const getFormattedTime = (timestamp: any) => {
  // or use padStart
  const date = timestamp;
  let hours = date?.getHours(),
    day = date?.getDate(),
    month = date?.getMonth(),
    year = date?.getFullYear();
  if (hours === 0) hours = 12;
  else if (hours > 12) {
    hours -= 12;
  }

  return monthsList[month] + " " + day + "," + " " + year;
};
export const getFormattedShortTime = (timestamp: any) => {
  // or use padStart
  const date = timestamp;
  let hours = date?.getHours(),
    minutes = date?.getMinutes();
  let time = "am";
  let zeroM = "";
  if (hours >= 12) {
    if (hours > 12) hours -= 12;
    time = "pm";
  }
  if (hours === 0) hours = 12;
  if (minutes < 10) zeroM = "0";
  return hours + ":" + zeroM + minutes + " " + time;
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

export const getPassedTime = (date: Date) => {
  const totalTime = new Date().getTime() - new Date(date).getTime();
  return Math.floor(totalTime / 1000);
};

export const getElapsedTime = (date: Date) => {
  // Get the start time as a Day.js instance
  const startTime = dayjs(date);

  // Calculate the elapsed time using `.fromNow()`
  const elapsedTime = startTime.fromNow();

  return elapsedTime;
};

export function formatHoursToDay(decimalHours: number, hoursPerDay = 8) {
  const totalMinutes = decimalHours * 60;
  const days = Math.floor(totalMinutes / (60 * hoursPerDay));
  const remainingMinutes = totalMinutes % (60 * hoursPerDay);

  const formattedParts = [];

  if (days > 0) {
    formattedParts.push(`${days}d`);
  }

  if (remainingMinutes > 0) {
    const hours = Math.floor(remainingMinutes / 60);
    const minutes = Math.floor(remainingMinutes % 60);
    if (hours > 0) {
      formattedParts.push(`${hours}h`);
    }
    if (minutes > 0) {
      formattedParts.push(`${minutes}m`);
    }
  }

  return formattedParts.join(" ");
}

export function getTimeFromDate(date: string | null) {
  if (!date) return 0;
  return new Date(date).getTime();
}
