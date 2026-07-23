import { formatDistanceToNowStrict, format } from "date-fns";

export function formatArticleDate(date: Date | string | null | undefined) {
  if (!date) {
    return "Unknown date";
  }

  const value = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(value.getTime())) {
    return "Unknown date";
  }

  const now = Date.now();
  const diffMs = now - value.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  if (diffMs >= 0 && diffMs < sevenDaysMs) {
    return `${formatDistanceToNowStrict(value)} ago`;
  }

  return format(value, "MMM d, yyyy");
}

