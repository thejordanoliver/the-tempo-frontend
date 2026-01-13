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

export function getNBASeason(): string {
  const today = dayjs();
  const year = today.year();
  const month = today.month() + 1; // 1–12

  // NBA season starts in October
  if (month >= 10) {
    return String(year);
  }

  // Jan–Sep belongs to previous season
  return String(year - 1);
}

export const getHolidayLabel = (
  date: Date | null | undefined
): string | null => {
  if (!date) return null;

  const month = date.getMonth(); // 0 = Jan, 11 = Dec
  const day = date.getDate();

  if (month === 11 && day === 25) return "Christmas Day";
  if (month === 0 && day === 1) return "New Year's Day";

  return null; // add more holidays here if needed
};
