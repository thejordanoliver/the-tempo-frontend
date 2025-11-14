// utils/CBBUtils/cbbGameUtils.ts

import { neutralSiteGames, conferenceObjectListMap, modalToMapKey } from "constants/teamsCBB";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
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
    formattedDate: date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
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

export function formatPeriod(raw: string | number | null | undefined) {
  if (!raw) return "";
  const map: Record<string, string> = {
    Q1: "1st",
    Q2: "2nd",
    Q3: "3rd",
    Q4: "4th",
    OT: "OT",
    OVERTIME: "OT",
    HT: "Halftime",
    FT: "Final",
  };

  if (typeof raw === "string") {
    const norm = raw.toUpperCase();
    if (map[norm]) return map[norm];
  }

  if (typeof raw === "number") {
    if (raw <= 4) {
      const suffix = raw === 1 ? "st" : raw === 2 ? "nd" : raw === 3 ? "rd" : "th";
      return `${raw}${suffix}`;
    }
    const otNum = raw - 4;
    return otNum === 1 ? "OT" : `${otNum}OT`;
  }
  return String(raw);
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

export function resolveVenue(homeTeam: any, awayTeam: any) {
  const homeName = homeTeam?.name ?? "";
  const awayName = awayTeam?.name ?? "";
  const neutralSite =
    neutralSiteGames[`${homeName}-${awayName}`] ||
    neutralSiteGames[`${awayName}-${homeName}`];

  const venue = {
    name: neutralSite?.name ?? homeTeam?.venue ?? "Unknown Stadium",
    city: neutralSite?.city ?? homeTeam?.city ?? "Unknown City",
    address: neutralSite?.address ?? homeTeam?.address ?? "",
    capacity: neutralSite?.venueCapacity ?? homeTeam?.venueCapacity ?? "",
    image: neutralSite?.venueImage ?? homeTeam?.venueImage ?? "",
    lat: neutralSite?.latitude ?? homeTeam?.latitude ?? null,
    lon: neutralSite?.longitude ?? homeTeam?.longitude ?? null,
  };

  return { ...venue, isNeutral: !!neutralSite };
}

// --- MAIN FILTER FUNCTION ---
export function filterCBBGames({
  games,
  selectedConference,
  top25Teams,
}: {
  games: CBBGame[];
  selectedConference: string;
  top25Teams: string[];
}): CBBGame[] {
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
    const home = (game?.teams?.home?.name || "").toLowerCase().trim();
    const away = (game?.teams?.away?.name || "").toLowerCase().trim();

    // --- Top 25 filter ---
    if (selectedConference === "Top 25") {
      return (
        top25Teams.some((team) => team.toLowerCase() === home) ||
        top25Teams.some((team) => team.toLowerCase() === away)
      );
    }

    // --- Conference filter ---
    if (selectedConference) {
      const conferenceMap: Record<string, (typeof conferenceObjectListMap)[0]> =
        Object.values(conferenceObjectListMap).reduce((acc, conf) => {
          acc[conf.name] = conf;
          return acc;
        }, {} as Record<string, (typeof conferenceObjectListMap)[0]>);

      const mapKey = modalToMapKey[selectedConference] || selectedConference;
      const conferenceTeams = conferenceMap[mapKey]?.teams?.map((t) =>
        t.toLowerCase()
      ) || [];

      return (
        conferenceTeams.includes(home) || conferenceTeams.includes(away)
      );
    }

    return true; // No conference filter → show all
  });

  // --- Sort live games first ---
const isLiveGame = (game: any) => {
  const statusLong = game.status?.long?.toLowerCase() ?? "";
  const statusShort = game.status?.short?.toLowerCase() ?? "";

  const live = ![
    "not started",
    "game finished",
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

