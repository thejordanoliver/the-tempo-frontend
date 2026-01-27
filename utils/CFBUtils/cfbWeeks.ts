import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);

export type CFBWeek = {
  label: string;
  stage: string;
  weekNumber: number;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
};

export function generateCFBWeeks(): CFBWeek[] {
  const result: CFBWeek[] = [];

  

  // --- Week 0 ---
  const week0Start = dayjs("2025-08-18").startOf("day");
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

  // --- Bowls (ends before championship starts) ---
  const bowlsStart = dayjs("2025-12-13").startOf("day");
  const bowlsEnd = dayjs("2026-01-18").endOf("day"); // Jan 18 23:59:59 — no overlap
  result.push({
    label: "Bowls",
    stage: "Bowls",
    weekNumber: 17,
    start: bowlsStart,
    end: bowlsEnd,
  });

  // --- Championship ---
  const champStart = dayjs("2026-01-19").startOf("day");
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

export function getWeekForDate(
  date: string | dayjs.Dayjs,
  weeks: CFBWeek[],
  apiWeekLabel?: string
): CFBWeek | undefined {
  if (apiWeekLabel?.toLowerCase() === "bowls") {
    return weeks.find((w) => w.label === "Bowls");
  }

  const target = dayjs(date);

  const armyNavyWeek = weeks.find((w) => w.label === "Week 16");
  if (
    armyNavyWeek &&
    target.isBetween(armyNavyWeek.start, armyNavyWeek.end, null, "[]")
  ) {
    return armyNavyWeek;
  }

  return weeks.find((w) => target.isBetween(w.start, w.end, null, "[]"));
}

export function getCurrentWeekIndex(weeks: CFBWeek[]): number {
  const today = dayjs();
  const index = weeks.findIndex((w) =>
    today.isBetween(w.start, w.end, null, "[]")
  );
  return index !== -1 ? index : 0;
}
