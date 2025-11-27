// utils/CBBUtils/cbbGameUtils.ts

import { conferenceObjectListMap, modalToMapKey } from "constants/teamsCBB";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { useMemo } from "react";
import { CBBGame } from "types/types";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

export type CBBWeek = {
  label: string;
  stage: string;
  weekNumber: number;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
};

// --- Parsing / utilities ---
export function parseCBBGameParam(param: any) {
  try {
    const game =
      typeof param === "string"
        ? JSON.parse(param)
        : Array.isArray(param)
        ? JSON.parse(param[0])
        : null;

    if (!game?.game?.id) {
      return {
        game: {
          id: "0",
          status: { short: "NS", long: "Not Started" },
          week: "",
        },
        teams: {
          home: { id: 0, nickname: "Home" },
          away: { id: 0, nickname: "Away" },
        },
        scores: { home: { total: 0 }, away: { total: 0 } },
      };
    }

    return game;
  } catch (e) {
    console.warn("Failed to parse CBB game:", e);
    return null;
  }
}

export function parseGameDate(rawDate: any): Date | null {
  if (!rawDate) return null;

  let raw: string | number | null = null;
  if (typeof rawDate === "object") {
    if (rawDate.timestamp) raw = rawDate.timestamp * 1000;
    else if (rawDate.date) raw = rawDate.date;
  } else if (typeof rawDate === "string") {
    raw = rawDate;
  }

  const date = raw ? new Date(raw) : null;
  return date && !isNaN(date.getTime()) ? date : null;
}

export function formatGameDateTime(date: Date | null) {
  if (!date) return { formattedDate: "", formattedTime: "", iso: "" };
  return {
    iso: date.toISOString(),
    formattedDate: date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
    }),
    formattedTime: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

export type GameStatus =
  | "Scheduled"
  | "In Progress"
  | "Halftime"
  | "Final"
  | "Canceled"
  | "Postponed"
  | "Delayed";

const statusMap: Record<string, GameStatus> = {
  NS: "Scheduled",
  Q1: "In Progress",
  Q2: "In Progress",
  Q3: "In Progress",
  Q4: "In Progress",
  OT: "In Progress",
  OVERTIME: "In Progress",
  HT: "Halftime",
  FT: "Final",
  AOT: "Final",
  CANC: "Canceled",
  PST: "Postponed",
  DELAYED: "Delayed",
};

export function getGameStatus(raw?: string): GameStatus {
  if (!raw) return "Scheduled";
  const normalized = raw.toUpperCase();
  return statusMap[normalized] ?? "Scheduled";
}

export function buildLineScore(scores: any) {
  if (!scores) return { home: [], away: [] };

  const extractPeriods = (teamScores: any) => {
    if (!teamScores) return [];

    const base = [
      teamScores.quarter_1,
      teamScores.quarter_2,
      teamScores.quarter_3,
      teamScores.quarter_4,
    ];

    // Collect all overtime fields that might exist (overtime, overtime_1, overtime_2, etc.)
    const otFields = Object.keys(teamScores)
      .filter((key) => key.toLowerCase().startsWith("overtime"))
      .map((key) => teamScores[key])
      .filter((v) => v != null);

    return [...base, ...otFields].map((v) => (v != null ? String(v) : "-"));
  };

  const home = extractPeriods(scores.home);
  const away = extractPeriods(scores.away);

  return { home, away };
}

// --- MAIN FILTER FUNCTION ---
export function filterCBBGames({
  games,
  selectedConference,
  top25Teams,
}: {
  games: CBBGame[];
  selectedConference: string;
  top25Teams: (string | number)[];
}): CBBGame[] {
  if (!games) return [];

  // --- Deduplicate games ---
  const seen = new Set<string>();
  const uniqueGames = games.filter((game) => {
 const gameId = game?.id ?? 0; // number
if (gameId === 0) return true;


    const home = String(game?.teams?.home?.id ?? "").trim();
    const away = String(game?.teams?.away?.id ?? "").trim();
    const id = `${away}-${home}`;

    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  // --- Filter by conference or Top 25 ---
  const gamesToFilter = uniqueGames.filter((game) => {
    const homeId = String(game?.teams?.home?.id ?? "").trim();
    const awayId = String(game?.teams?.away?.id ?? "").trim();

    // --- Top 25 filter ---
    if (selectedConference === "Top 25") {
      const top25Ids = top25Teams.map(String);
      return top25Ids.includes(homeId) || top25Ids.includes(awayId);
    }

    // --- Conference filter ---
    if (selectedConference) {
      const conferenceMap: Record<string, typeof conferenceObjectListMap[0]> = Object.fromEntries(
        Object.values(conferenceObjectListMap).map((conf) => [conf.name, conf])
      );
      const mapKey = modalToMapKey[selectedConference] || selectedConference;
      const conferenceTeams = conferenceMap[mapKey]?.teams?.map(String) || [];
      return conferenceTeams.includes(homeId) || conferenceTeams.includes(awayId);
    }

    return true;
  });

  // --- Sort live games first safely ---
  const isLiveGame = (game: CBBGame) => {
    const statusLong = game?.status?.long?.toLowerCase() ?? "";
    const statusShort = game?.status?.short?.toLowerCase() ?? "";
    const live = !["not started", "final", "canceled", "delayed", "postponed"].includes(statusLong);
    const isFinal = statusLong === "final" || statusLong.includes("after over") || statusShort === "ft";
    return live && !isFinal;
  };

return [...gamesToFilter].sort((a, b) => {
  const liveA = Number(isLiveGame(a));
  const liveB = Number(isLiveGame(b));
  return liveB - liveA;
});
}

// --- Hook: Build AP Top 25 ---
export function useAPTop25() {
  const { rankings } = useCBBRankings();

  const apTop25 = useMemo(() => {
    if (!rankings) return [];

    const apPoll = rankings.find((p) => p.shortName === "AP Poll");
    if (!apPoll) return [];

    return apPoll.ranks.slice(0, 25).map((r) => ({
      id: String(r.team?.id), // ✅ include ESPN ID
      name:
        r.team?.name ||
        r.team?.shortDisplayName ||
        r.team?.name ||
        r.team?.nickname ||
        "Unknown",
      rank: r.current,
    }));
  }, [rankings]);

  return apTop25;
}
