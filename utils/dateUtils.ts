// utils/dateUtils.ts

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export const isTodayOrTomorrow = (dateString: string) => {
  const gameDate = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  return (
    (gameDate >= today && gameDate < new Date(today.getTime() + 86400000)) ||
    (gameDate >= tomorrow && gameDate < new Date(tomorrow.getTime() + 86400000))
  );
};

export function getCurrentNBASeason() {
  const today = dayjs();
  const year = today.year();

  const seasonStart = dayjs(`${year}-10-01`);
  const seasonEnd = dayjs(`${year + 1}-06-30`);

  // Case 1: Oct–Dec → season = current year
  if (
    today.isAfter(seasonStart) &&
    today.isBefore(dayjs(`${year}-12-31`).endOf("day"))
  ) {
    return String(year + 1); // Example: October 2024 → returns 2025 season
  }

  // Case 2: Jan–Jun → season = previous year + 1
  if (today.isBefore(seasonEnd)) {
    return String(year);
  }

  // Case 3: July–Sept → offseason, next season
  return String(year + 1);
}

export function getNBASeason() {
  const today = dayjs();
  const year = today.year();

  // Season YEAR runs Oct 1 (YEAR-1) to Sep 30 (YEAR)
  const seasonStart = dayjs(`${year}-09-01`); // Oct 1 of previous year
  const seasonEnd = dayjs(`${year + 1}-09-30`); // Sep 30 of current year

  // If today is between last Oct 1 and this Sep 30 → season = current year
  if (today.isAfter(seasonStart) && today.isBefore(seasonEnd.add(1, "day"))) {
    return String(year);
  }

  // Otherwise we are past Oct 1 → new season
  return String(year + 1);
}
