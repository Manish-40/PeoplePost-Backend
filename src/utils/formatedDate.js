import dayjs from "dayjs";

export function formatLinkedInTime(dateString) {
  const now = dayjs();
  const past = dayjs(dateString);

  const minutes = now.diff(past, "minute");
  const hours = now.diff(past, "hour");
  const days = now.diff(past, "day");
  const weeks = now.diff(past, "week");
  const months = now.diff(past, "month");
  const years = now.diff(past, "year");

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  if (weeks < 4) return `${weeks}w`;
  if (months < 12) return `${months}mo`;
  return `${years}y`;
}

export function getMonth(monthNumber) {
  switch(monthNumber) {
    case 1:
      return 'Jan';
    case 2:
      return 'Feb';
    case 3:
      return 'Mar';
    case 4:
      return 'Apr';
    case 5:
      return 'May';
    case 6:
      return 'Jun';
    case 7:
      return 'Jul';
    case 8:
      return 'Aug';
    case 9:
      return 'Sep';
    case 10:
      return 'Oct';
    case 11:
      return 'Nov';
    case 12:
      return 'Dec';
    default:
      throw new Error('Invalid Month Number.')
  }
  
}

// Example:
//console.log(formatLinkedInTime("2025-11-29T14:02:54.105Z"));
