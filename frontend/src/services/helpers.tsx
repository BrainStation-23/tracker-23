export function getPositionSuffix(number: number) {
  if (number >= 10 && number <= 20) {
    return number + "th";
  } else {
    const lastDigit = number % 10;
    switch (lastDigit) {
      case 1:
        return number + "st";
      case 2:
        return number + "nd";
      case 3:
        return number + "rd";
      default:
        return number + "th";
    }
  }
}

export function capitalizeFirstLetter(string: string) {
  return string[0].toUpperCase() + string.slice(1);
}
