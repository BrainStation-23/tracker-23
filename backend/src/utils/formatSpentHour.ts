function formatSpentHour(totalHours: number): string {
  const hours = Math.floor(totalHours);
  const minutes = Math.round((totalHours - hours) * 60);

  if (hours === 0 && minutes === 0) {
    return '0 m';
  }

  const hourPart = hours > 0 ? `${hours} hr${hours > 1 ? 's' : ''}` : '';
  const minutePart = minutes > 0 ? `${minutes} m` : '';
  return [hourPart, minutePart].filter(Boolean).join(' ').trim();
}

export default formatSpentHour;
