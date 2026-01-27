import dayjs from "dayjs";
import { Game } from "types/nfl";

export type NFLWeekFromGames = {
  label: string;       // e.g., "Pre Week 1", "Week 1", "Hall of Fame Weekend"
  stage: string;       // "Pre Season", "Regular Season", "Post Season"
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
  games: Game[]
};

/**
 * Generate week objects from API games
 */
export function generateWeeksFromGames(games: Game[]): NFLWeekFromGames[] {
  if (!games || games.length === 0) return [];

  const weekMap = new Map<string, NFLWeekFromGames>();

  games.forEach((g) => {
    const stage = g.game.stage;
    let weekLabel = g.game.week;

    // Prepend "Pre " for Preseason numeric weeks
    if (stage === "Pre Season" && weekLabel.toLowerCase().startsWith("week")) {
      weekLabel = "Pre " + weekLabel;
    }

    const key = `${stage}-${weekLabel}`;
    const gameDate = dayjs.unix(g.game.date.timestamp);

    if (!weekMap.has(key)) {
      weekMap.set(key, {
        label: weekLabel,
        stage,
        start: gameDate,
        end: gameDate,
        games: [g], // ✅ INIT WITH FIRST GAME
      });
    } else {
      const existing = weekMap.get(key)!;

      existing.games.push(g); // ✅ PUSH GAME

      if (gameDate.isBefore(existing.start)) existing.start = gameDate;
      if (gameDate.isAfter(existing.end)) existing.end = gameDate;
    }
  });

  return Array.from(weekMap.values()).sort(
    (a, b) => a.start.unix() - b.start.unix()
  );
}


/**
 * Get current week index
 */
export function getCurrentWeekIndexFromGames(weeks: NFLWeekFromGames[]): number {
  const today = dayjs();
  const index = weeks.findIndex((w) => today.isBetween(w.start, w.end, null, "[]"));
  if (index !== -1) return index;

  // If today is after all weeks, return last past week
  const pastWeeks = weeks.filter((w) => today.isAfter(w.end));
  return pastWeeks.length > 0 ? weeks.indexOf(pastWeeks[pastWeeks.length - 1]) : 0;
}

/**
 * Filter games by a selected week
 */
export function filterGamesByWeek(games: Game[], week: NFLWeekFromGames): Game[] {
  return games.filter((g) => {
    let gameWeek = g.game.week;

    // Prepend "Pre " for Preseason numeric weeks
    if (g.game.stage === "Pre Season" && gameWeek.toLowerCase().startsWith("week")) {
      gameWeek = "Pre " + gameWeek;
    }

    // Stage must match
    if (g.game.stage !== week.stage) return false;

    // Week label exact match
    return gameWeek.toLowerCase() === week.label.toLowerCase();
  });
}
