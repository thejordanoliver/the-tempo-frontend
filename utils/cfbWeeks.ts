// utils/cfbWeeks.ts
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export type CFBWeek = {
  label: string;
  stage: string;
  weekNumber: number;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
};

/**
 * Generates all CFB weeks for the 2025 season, including Week 16 for Army/Navy.
 */
export function generateCFBWeeks(): CFBWeek[] {
  const result: CFBWeek[] = [];

  // --- Week 0 ---
  const week0Start = dayjs.tz("2025-08-18", "America/New_York").startOf("day");
  const week0End = week0Start.add(6, "day").endOf("day");
  result.push({
    label: "Week 0",
    stage: "Regular Season",
    weekNumber: 0,
    start: week0Start,
    end: week0End,
  });

  // --- Weeks 1–16 Regular Season ---
  const regularStart = week0End.add(1, "second");
  for (let i = 0; i < 16; i++) {
    const start = regularStart.add(i, "week").startOf("day");
    const end = start.add(6, "day").endOf("day");
    result.push({
      label: `Week ${i + 1}`,
      stage: "Regular Season",
      weekNumber: i + 1,
      start,
      end,
    });
  }

  // --- Bowls ---
  const bowlsStart = dayjs.tz("2025-12-13", "America/New_York").startOf("day"); // include Dec 13 games
  const bowlsEnd = dayjs.tz("2026-01-18", "America/New_York").endOf("day");
  result.push({
    label: "Bowls",
    stage: "Bowls",
    weekNumber: 17,
    start: bowlsStart,
    end: bowlsEnd,
  });

  // --- Championship (CFP) Jan 19+ ---
  const champStart = dayjs.tz("2026-01-19", "America/New_York").startOf("day");
  const champEnd = champStart.add(7, "day").endOf("day");
  result.push({
    label: "Championship",
    stage: "Championship",
    weekNumber: 18,
    start: champStart,
    end: champEnd,
  });

  return result;
}

/**
 * Get the week object for a given date or optional API week label
 */
export function getWeekForDate(
  date: string | dayjs.Dayjs,
  weeks: CFBWeek[],
  apiWeekLabel?: string
): CFBWeek | undefined {
  // 1️⃣ If the API explicitly says "Bowls", return the Bowls week first
  if (apiWeekLabel?.toLowerCase() === "bowls") {
    return weeks.find((w) => w.label === "Bowls");
  }

  const target = dayjs.isDayjs(date)
    ? date.tz("America/New_York")
    : dayjs.tz(date, "America/New_York");

  // 2️⃣ Army/Navy Week 16 check
  const armyNavyWeek = weeks.find((w) => w.label === "Week 16");
  if (armyNavyWeek && target.isBetween(armyNavyWeek.start, armyNavyWeek.end, null, "[]")) {
    return armyNavyWeek;
  }

  // 3️⃣ Fallback to normal date-based week
  return weeks.find((w) => target.isBetween(w.start, w.end, null, "[]"));
}

/**
 * Get current week index based on today's date
 */
export function getCurrentWeekIndex(weeks: CFBWeek[]): number {
  const today = dayjs().tz("America/New_York");
  const index = weeks.findIndex((w) => today.isBetween(w.start, w.end, null, "[]"));
  return index !== -1 ? index : 0; // default to Week 0 if today is before the season
}
