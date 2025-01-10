import { StatusEnum } from 'src/module/tasks/dto';

export function formatSpentHour(totalHours: number): string {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  if (hours === 0 && minutes === 0) {
    return '0 m';
  }

  const hourPart = hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''}` : '';
  const minutePart = minutes > 0 ? `${minutes} m` : '';
  return [hourPart, minutePart].filter(Boolean).join(' ').trim();
}

export function convertToISO(dateString?: string): Date {
  let date: Date;

  if (dateString) {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

    if (isoRegex.test(dateString)) {
      date = new Date(dateString);
    } else {
      const [month, day, year] = dateString.split('-').map(Number);
      date = new Date(Date.UTC(year, month - 1, day, 6, 1));
    }
  } else {
    date = new Date();
  }

  return date;
}

export function getYesterday(date: Date): Date {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

export function doesTodayTask(
  startTime: Date,
  endTime: Date,
  task: any,
  today = false,
): boolean {
  if (today && task.statusCategoryName === StatusEnum.IN_PROGRESS) return true;

  const taskSessions = task.sessions || [];
  const taskUpdatedAt = new Date(
    task.jiraUpdatedAt ?? task.updatedAt,
  ).getTime();

  if (
    taskUpdatedAt >= startTime.getTime() &&
    taskUpdatedAt <= endTime.getTime()
  ) {
    return true;
  }

  for (const session of taskSessions) {
    const sessionStartTime = new Date(session.startTime).getTime();
    const sessionEndTime = new Date(session.endTime).getTime();

    if (
      (sessionStartTime >= startTime.getTime() &&
        sessionStartTime <= endTime.getTime()) ||
      (sessionEndTime >= startTime.getTime() &&
        sessionEndTime <= endTime.getTime())
    ) {
      return true;
    }
  }

  return false;
}

export function formattedDate(syncDateTime: Date | null | undefined): string {
  let startDate;
  if (syncDateTime) {
    startDate = new Date(syncDateTime).toISOString();
  } else {
    startDate = new Date().toISOString();
  }
  const date = new Date(startDate);
  const pad = (num: any) => num.toString().padStart(2, '0');
  return (
    `${pad(date.getMonth() + 1)}/${pad(
      date.getDate(),
    )}/${date.getFullYear()} ` + `00:00:00Z`
  );
}

export function getSpentHour(task: any) {
  const estimation = task['Microsoft.VSTS.Scheduling.Effort'] ?? null;
  const remainingWork = task['Microsoft.VSTS.Scheduling.RemainingWork'] ?? null;
  if (estimation && remainingWork) {
    return estimation - remainingWork;
  } else if (estimation && !remainingWork) {
    return 0;
  } else if (!estimation && remainingWork) {
    return 8 - remainingWork;
  } else {
    return 0;
  }
}
