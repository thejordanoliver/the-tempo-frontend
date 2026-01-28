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

export function getFootballSeasonYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month < 7 ? year - 1 : year;
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


export function getMLBSeason(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 11 = Dec

  // MLB season starts in April
  // Jan–Mar belong to previous season
  if (month < 3) {
    return String(year - 1);
  }

  // Apr–Dec belongs to current year season
  return String(year);
}
