import * as dayjs from 'dayjs';

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

export function doesTodayTask(time: number, task: any) {
  const sessions = task?.sessions;
  const parsedTime = dayjs(new Date(time));
  const startTime = parsedTime.startOf('day').valueOf();
  const endTime = parsedTime.endOf('day').valueOf();
  if (
    new Date(task.jiraUpdatedAt ?? task.updatedAt).getTime() >= startTime &&
    new Date(task.jiraUpdatedAt ?? task.updatedAt).getTime() <= endTime
  ) {
    return true;
  }
  for (let index = 0, len = sessions.length; index < len; index++) {
    const session = sessions[index];
    if (
      new Date(session.startTime).getTime() >= startTime &&
      new Date(session.startTime).getTime() <= endTime
    ) {
      return true;
    }
  }
  return false;
}
