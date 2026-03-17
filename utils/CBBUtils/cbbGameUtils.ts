// utils/CBBUtils/cbbGameUtils.ts

import { getTeamByESPNId, getTeamInfo } from "constants/teamsCBB";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { useMemo } from "react";

import {
  conferenceObjectListMap,
  modalToMapKey,
  teams,
} from "constants/teamsCBB";
import { useCBBRankings } from "hooks/CBBHooks/useCBBRankings";
import { CBBGame } from "types/types";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

/* =====================================================
   TYPES
===================================================== */

export type CBBWeek = {
  label: string;
  stage: string;
  weekNumber: number;
  start: dayjs.Dayjs;
  end: dayjs.Dayjs;
};

export type GameStatus =
  | "Scheduled"
  | "In Progress"
  | "Halftime"
  | "Final"
  | "Canceled"
  | "Postponed"
  | "Delayed";

/* =====================================================
   DATE / STATUS HELPERS
===================================================== */

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

type RawVenue = {
  id?: string;
  name?: string;
  fullName?: string;
  city?: string;
  address?: any;
  latitude?: number;
  longitude?: number;
  capacity?: number | string;
  images?: any[];
};

function normalizeVenueName(v?: RawVenue, fallback?: string) {
  return (v?.fullName ?? v?.name ?? fallback ?? "").trim().toLowerCase();
}

export function formatVenueAddress(address: any) {
  if (!address) return "";
  if (typeof address === "string") return address;
  if (typeof address === "object") {
    return [address.city, address.state].filter(Boolean).join(", ");
  }
  return "";
}

export function resolveVenue({
  venue,
  homeTeamData,
  neutralVenues,
}: {
  venue?: RawVenue;
  homeTeamData: any;
  neutralVenues: Record<string, any>;
}) {
  const venueName = normalizeVenueName(venue, homeTeamData?.venueName);

  const neutralEntry = Object.entries(neutralVenues).find(([key]) =>
    venueName.includes(key.toLowerCase()),
  );

  // Base venue (ESPN → team fallback)
  let resolved = {
    isNeutral: false,
    name: venue?.fullName ?? venue?.name ?? homeTeamData?.venueName ?? "",
    image: venue?.images?.[0]?.href ?? homeTeamData?.venueImage ?? "",
    city: venue?.city ?? homeTeamData?.city ?? homeTeamData?.location ?? "",
    address: formatVenueAddress(venue?.address ?? homeTeamData?.address),
    capacity: venue?.capacity ?? homeTeamData?.venueCapacity ?? "",
    latitude: venue?.latitude ?? homeTeamData?.latitude ?? null,
    longitude: venue?.longitude ?? homeTeamData?.longitude ?? null,
  };

  // Override if neutral
  if (neutralEntry) {
    const [, neutral] = neutralEntry;

    resolved = {
      ...resolved,
      isNeutral: true,
      name: neutral.name ?? resolved.name,
      image: neutral.venueImage ?? resolved.image,
      city: neutral.city ?? resolved.city,
      address: formatVenueAddress(neutral.address ?? resolved.address),
      capacity: neutral.venueCapacity ?? resolved.capacity,
      latitude: neutral.latitude ?? resolved.latitude,
      longitude: neutral.longitude ?? resolved.longitude,
    };
  }

  return resolved;
}

export function getGameStatus(raw?: string): GameStatus {
  if (!raw) return "Scheduled";
  return statusMap[raw.toUpperCase()] ?? "Scheduled";
}

export function parseGameDate(rawDate: any): Date | null {
  if (!rawDate) return null;

  const raw =
    typeof rawDate === "object"
      ? rawDate.timestamp
        ? rawDate.timestamp * 1000
        : rawDate.date
      : rawDate;

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

/* =====================================================
   LINE SCORE
===================================================== */

export function buildLineScore(scores: any) {
  if (!scores) return { home: [], away: [] };

  const extract = (teamScores: any) => {
    if (!teamScores) return [];

    const base = [
      teamScores.quarter_1,
      teamScores.quarter_2,
      teamScores.quarter_3,
      teamScores.quarter_4,
    ];

    const ot = Object.keys(teamScores)
      .filter((k) => k.toLowerCase().startsWith("overtime"))
      .map((k) => teamScores[k])
      .filter(Boolean);

    return [...base, ...ot].map((v) => (v != null ? String(v) : "-"));
  };

  return {
    home: extract(scores.home),
    away: extract(scores.away),
  };
}

export const resolveConferenceTeamNameToESPN = (
  name: string,
): string | null => {
  const normalized = name.toLowerCase().trim();

  const team = teams.find(
    (t) =>
      t.fullName?.toLowerCase() === normalized ||
      t.name?.toLowerCase() === normalized,
  );

  return team?.espnID ? String(team.espnID) : null;
};

/* =====================================================
   MAIN FILTER FUNCTION
===================================================== */

export function filterCBBGames({
  games,
  selectedConference,
  top25Teams,
}: {
  games: CBBGame[];
  selectedConference: string;
  top25Teams: string[]; // ESPN IDs
}): CBBGame[] {
  if (!games?.length) return [];

  // --- Deduplicate games ---
  const seen = new Set<string>();
  const uniqueGames = games.filter((g) => {
    const key = `${g?.teams?.away?.id}-${g?.teams?.home?.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return uniqueGames.filter((game) => {
    const home = getTeamInfo(Number(game.teams.home.id));
    const away = getTeamInfo(Number(game.teams.away.id));
    const homeESPN = home?.espnID;
    const awayESPN = away?.espnID;

    if (!homeESPN && !awayESPN) return false;

    // --- TOP 25 ---
    if (selectedConference === "Top 25") {
      return (
        (homeESPN && top25Teams.includes(String(homeESPN))) ||
        (awayESPN && top25Teams.includes(String(awayESPN)))
      );
    }

    // --- CONFERENCE ---
    if (selectedConference) {
      const mapKey = modalToMapKey[selectedConference] || selectedConference;

      const conference = conferenceObjectListMap.find((c) => c.name === mapKey);

      if (!conference) return false;

      const conferenceESPNIds = conference.teams.filter(Boolean) as string[];

      return (
        (homeESPN && conferenceESPNIds.includes(String(homeESPN))) ||
        (awayESPN && conferenceESPNIds.includes(String(awayESPN)))
      );
    }

    return true;
  });
}



/* =====================================================
   AP TOP 25 (LEAGUE-AWARE)
===================================================== */

export function useAPTop25(league: "CBB" | "WCBB") {
  const { rankings } = useCBBRankings(league);

  return useMemo(() => {
    const apPoll = rankings.find((p) => p.shortName === "AP Poll");
    if (!apPoll) return [];

    return apPoll.ranks
      .slice(0, 25)
      .map((r) => {
        const team = getTeamByESPNId(r.team?.id ?? 0);

        if (!team) return null;

        return {
          id: String(team.espnID), // ✅ canonical ESPN ID
          name: team.fullName || team.name, // ✅ consistent naming
          rank: r.current,
          code: team.code,
          logo: team.logo,
          color: team.color,
          secondaryColor: team.secondaryColor,
        };
      })
      .filter(Boolean);
  }, [rankings]);
}
