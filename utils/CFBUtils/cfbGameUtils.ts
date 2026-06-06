// utils/CFBUtils/cfbGameUtils.ts
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useCFBRankings } from "hooks/FootballHooks/useCFBRankings";
import { useMemo } from "react";

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
