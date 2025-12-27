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
  console.log("monthNumber: ", monthNumber)
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

export function getMonthNumber(monthName) {
  switch(monthName) {
    case 'Jan': return '01';
    case 'Feb': return '02';
    case 'Mar': return '03';
    case 'Apr': return '04';
    case 'May': return '05';
    case 'Jun': return '06';
    case 'Jul': return '07';
    case 'Aug': return '08';
    case 'Sep': return '09';
    case 'Oct': return '10';
    case 'Nov': return '11';
    case 'Dec': return '12';
    default:
      throw new Error('Invalid Month Name');
  }
}

export const formatChatTime = (createdAt) => {
  const date = new Date(createdAt);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return time;                 // 3:45 PM
  if (isYesterday) return `Yesterday ${time}`; // Yesterday 3:45 PM

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + ` ${time}`; // 12 Oct 2025 3:45 PM
};

// Example:
//console.log(formatLinkedInTime("2025-11-29T14:02:54.105Z"));
