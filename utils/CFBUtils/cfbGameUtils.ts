// utils/CFBUtils/cfbGameUtils.ts

import { conferenceObjectListMap, modalToMapKey } from "constants/teamsCFB";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCFBRankings } from "hooks/FootballHooks/useCFBRankings";
import { useMemo } from "react";
import type { Game } from "types/football";

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

// --- Parsing / utilities ---
export function parseCFBGameParam(param: any) {
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
    console.warn("Failed to parse CFB game:", e);
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
      month: "short",
      day: "numeric",
    }),
    formattedTime: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
}

// --- MAIN FILTER FUNCTION ---
export function filterCFBGames({
  games,
  selectedConference,
  top25Teams,
}: {
  games: Game[];
  selectedConference: string;
  top25Teams: string[];
}): Game[] {
  if (!games) return [];

  // --- Deduplicate games (skip if id === "0") ---
  const seen = new Set<string>();
  const uniqueGames = games.filter((game: any) => {
    const gameId = game?.game?.id ?? "0";

    // Always keep placeholder games with id "0"
    if (gameId === "0") return true;

    const home = (game?.teams?.home?.name || "").toLowerCase().trim();
    const away = (game?.teams?.away?.name || "").toLowerCase().trim();
    const id = `${away}-${home}`; // normalized ID

    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  let gamesToFilter = uniqueGames;

  // --- Filter by conference or Top 25 ---
  gamesToFilter = uniqueGames.filter((game) => {
    // --- Bowl check first ---
    const isBowlGame =
      game.game.week === "Bowls" ||
      game.game.stage === "Bowls" ||
      (typeof game.game.week === "number" && game.game.week >= 17);

    if (isBowlGame) return true;

    const home = game.teams.home?.name;
    const away = game.teams.away?.name;

    // --- Top 25 filter ---
    if (selectedConference === "Top 25") {
      return top25Teams.includes(home) || top25Teams.includes(away);
    }

    // --- Conference filter ---
    if (selectedConference) {
      const conferenceMap: Record<string, (typeof conferenceObjectListMap)[0]> =
        Object.values(conferenceObjectListMap).reduce(
          (acc, conf) => {
            acc[conf.name] = conf;
            return acc;
          },
          {} as Record<string, (typeof conferenceObjectListMap)[0]>,
        );

      const mapKey = modalToMapKey[selectedConference] || selectedConference;
      const conferenceTeams = conferenceMap[mapKey]?.teams || [];
      return conferenceTeams.includes(home) || conferenceTeams.includes(away);
    }

    return true;
  });

  // --- Sort live games first ---
  const isLiveGame = (game: any) => {
    const statusLong = game.game.status.long?.toLowerCase() ?? "";
    const statusShort = game.game.status.short?.toLowerCase() ?? "";
    const live = ![
      "not started",
      "final",
      "canceled",
      "delayed",
      "postponed",
    ].includes(statusLong);
    const isFinal =
      statusLong === "final" ||
      statusLong.includes("after over") ||
      statusShort === "ft";
    return live && !isFinal;
  };

  return [...gamesToFilter].sort((a, b) => {
    const liveA = isLiveGame(a) ? 1 : 0;
    const liveB = isLiveGame(b) ? 1 : 0;
    return liveB - liveA;
  });
}

// --- Hook: Build AP Top 25 ---
export function useAPTop25() {
  const { rankings } = useCFBRankings();

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
export function useCFPTop25() {
  const { rankings } = useCFBRankings();

  const cfpTop25 = useMemo(() => {
    if (!rankings) return [];

    const cfpPoll = rankings.find((p) => p.shortName === "CFP Rankings");
    if (!cfpPoll) return [];

    return cfpPoll.ranks.slice(0, 25).map((r) => ({
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

  return cfpTop25;
}

// --- Helper: Normalize names for fuzzy matching ---
export const normalizeTeamName = (name?: string) =>
  (name || "")
    .toLowerCase()
    .replace(/[\s.]+/g, "")
    .replace(/(university|state|college|football|team)/gi, "")
    .trim();

// --- Helper: Get rank by team name ---
export const getTeamRankFromAPById = (
  teamId: number | string,
  apTop25: any[],
) => {
  if (!teamId || !apTop25?.length) return null;
  const entry = apTop25.find((t) => String(t.id) === String(teamId));
  return entry ? `${entry.rank}` : null;
};
export const getTeamRankFromCFPById = (
  teamId: number | string,
  cfpTop25: any[],
) => {
  if (!teamId || !cfpTop25?.length) return null;
  const entry = cfpTop25.find((t) => String(t.id) === String(teamId));
  return entry ? `${entry.rank}` : null;
};
