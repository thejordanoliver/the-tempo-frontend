// utils/games.ts
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { CBBTeam } from "types/types";

dayjs.extend(utc);
dayjs.extend(timezone);

// ---------- 🧩 Types ----------
export type TeamLike = {
  id: string;
  name: string;
  record?: string;
  logo?: any;
  fullName: string;
};

// ---------- 🧩 Team Helpers ----------
export const hasIdAndName = (team: any): team is TeamLike =>
  team && (typeof team.id === "string" || typeof team.id === "number") && typeof team.name === "string";

export function normalizeTeam(team: any, isWomen = false) {
  if (!team) return null;

  return {
    ...team,
    id: isWomen
      ? String(team.wid ?? team.id) // 👈 WCBB uses wid
      : String(team.id),
  };
}



// ---------- 🗓️ Date Helpers ----------
export const localDateOnly = (date: string | Date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Converts an API date to device local time and returns both the Date object and YYYY-MM-DD string.
 */
export function toLocalDate(apiDate: any) {
  const nowLocal = dayjs();

  if (!apiDate) {
    return { date: nowLocal.toDate(), dateString: nowLocal.format("YYYY-MM-DD") };
  }

  let local;
  if (apiDate.timestamp) {
    local = dayjs.unix(apiDate.timestamp).local();
  } else if (apiDate.date) {
    local = dayjs(apiDate.date).local();
  } else {
    local = dayjs(apiDate).local();
  }

  return {
    date: local.toDate(),
    dateString: local.format("YYYY-MM-DD"),
  };
}

/**
 * Filters games by a selected local date.
 */
export function filterByDate(games: any[], date: Date) {
  const selectedLocal = dayjs(date).format("YYYY-MM-DD");

  return games.filter((g) => {
    if (!g.date) return false;
    const gameLocal = dayjs(g.date).format("YYYY-MM-DD");
    return gameLocal === selectedLocal;
  });
}

// ---------- 🏈 Normalize NFL Games ----------
/**
 * Normalizes NFL game data to device local time.
 */
export const normalizeNFLGames = (games: any[]) => {
  return games.map((g) => {
    const { date, dateString } = toLocalDate(g.game?.date);

    // Optional: handle rare early-morning kickoff display issues if needed
    const hhmm = dayjs(date).format("HH:mm");
    const finalDate = hhmm >= "00:00" && hhmm <= "00:29" ? dayjs(date).subtract(4, "hour").toDate() : date;

    return {
      ...g,
      home: normalizeTeam(g.teams?.home),
      away: normalizeTeam(g.teams?.away),
      date: finalDate,
      dateString,
      status: g.game?.status ?? "unknown",
    };
  });
};

// ---------- ⏱️ Live Game Check ----------
export function isLiveGame(game: any) {
  const statusLong = String(game.status?.long ?? "").toLowerCase();
  const statusShort = game.status?.short;

  // NBA numeric codes
  if (statusShort === 2) return true; // In Progress
  if (statusShort === 1) return false; // Not Started
  if (statusShort === 3) return false; // Finished

  // fallback for string-based leagues
  const nonLive = ["not started", "final", "game finished", "canceled", "postponed", "delayed"];
  if (nonLive.includes(statusLong)) return false;

  return true;
};
