// utils/dateUtils.ts

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { Dimensions, ScrollView } from "react-native";

dayjs.extend(utc);
dayjs.extend(timezone);


export const isTodayOrTomorrow = (dateString: string) => {
  const gameDate = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
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

export function getNBACalendarSeason(): string {
  const today = dayjs();
  const year = today.year();
  const month = today.month() + 1; // 1–12

  let startYear: number;
  let endYear: number;

  // NBA season starts in October
  if (month >= 10) {
    startYear = year;
    endYear = year + 1;
  } else {
    startYear = year - 1;
    endYear = year;
  }

  // Return in "YYYY-YY" format
  return `${String(endYear)}`;
}

export function getFootballSeasonYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth();
  return month < 7 ? year - 1 : year;
}

export const getHolidayLabel = (
  date: Date | null | undefined,
): string | null => {
  if (!date) return null;

  const month = date.getMonth(); // 0 = Jan, 11 = Dec
  const day = date.getDate();

  if (month === 11 && day === 25) return "Christmas Day";
  if (month === 0 && day === 1) return "New Year's Day";

  return null; // add more holidays here if needed
};

export function getMLBSeason(date: Date = new Date()): string {
  return String(date.getFullYear());
}

export function getMLBStandingsSeason(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 1 = Feb, 2 = March

  // Before March (Jan & Feb) → use previous season
  if (month < 2) {
    return String(year - 1);
  }

  // March and later → use current year
  return String(year);
}


export function getNHLSeason(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Jan, 11 = Dec

  // NHL season starts in October
  // Jan–Sep belong to previous season
  if (month < 9) {
    return String(year);
  }

  // Oct–Dec belong to current year season
  return String(year);
}

export function getGameCountByMonth<T>(
  games: T[],
  getDate: (game: T) => string | Date | null,
): Map<string, number> {
  const count = new Map<string, number>();

  games.forEach((game) => {
    const dateVal = getDate(game);
    if (!dateVal) return;

    const date = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    count.set(key, (count.get(key) || 0) + 1);
  });

  return count;
}

export function getMonthsToShow<T>(
  games: T[],
  getDate: (game: T) => string | Date | null,
) {
  const map = new Map<string, { month: number; year: number }>();

  games.forEach((game) => {
    const dateVal = getDate(game);
    if (!dateVal) return;

    const date = typeof dateVal === "string" ? new Date(dateVal) : dateVal;
    if (isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${date.getMonth()}`;
    map.set(key, { year: date.getFullYear(), month: date.getMonth() });
  });

  return Array.from(map.values()).sort(
    (a, b) => a.year * 12 + a.month - (b.year * 12 + b.month),
  );
}

export const scrollToMonth = (
  scrollRef: React.RefObject<ScrollView | null>,
  months: { month: number; year: number }[],
  month: number,
  year: number,
  index: number,
) => {
  if (!scrollRef.current) return; // ✅ null check

  const screenWidth = Dimensions.get("window").width;
  const itemWidth = 70; // your month button width
  const spacing = 12; // your padding/margin

  const scrollToX =
    index * itemWidth + index * spacing - screenWidth / 2 + itemWidth / 2;

  scrollRef.current.scrollTo({
    x: Math.max(0, scrollToX),
    animated: true,
  });
};


 export const calculateAge = (date?: string | null) => {
    if (!date) return null;

    const birthDate = new Date(date);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };