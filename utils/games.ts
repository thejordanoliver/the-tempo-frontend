// utils/games.ts
import { neutralVenues } from "constants/teams";
import { neutralStadiums as cfbNeutralStadiums } from "constants/teamsCFB";
import { neutralStadiums } from "constants/teamsNFL";
import { neutralVenues as nhlNeutralVenues } from "constants/teamsNHL";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
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
  team &&
  (typeof team.id === "string" || typeof team.id === "number") &&
  typeof team.name === "string";

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
    return {
      date: nowLocal.toDate(),
      dateString: nowLocal.format("YYYY-MM-DD"),
    };
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

export const filterMLBByDate = (games: any[], selectedDate: Date) => {
  return games.filter((game) => {
    if (!game.date) return false;

    const gameDate = new Date(game.date);

    return (
      gameDate.getFullYear() === selectedDate.getFullYear() &&
      gameDate.getMonth() === selectedDate.getMonth() &&
      gameDate.getDate() === selectedDate.getDate()
    );
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
  const nonLive = [
    "not started",
    "final",
    "game finished",
    "canceled",
    "postponed",
    "delayed",
  ];
  if (nonLive.includes(statusLong)) return false;

  return true;
}

export const formatQuarter = (period?: number | string) => {
  if (!period) return "";

  const p = Number(period);
  if (!isNaN(p)) {
    if (p <= 4) return ["1st", "2nd", "3rd", "4th"][p - 1];
    const otNumber = p - 4;
    return otNumber === 1 ? "OT" : `OT${otNumber}`;
  }

  // fallback for string values like "ot", "overtime"
  const val = String(period).toLowerCase();
  if (val.includes("ot") || val.includes("overtime")) {
    const match = val.match(/\d+/);
    return match ? `OT${match[0]}` : "OT";
  }

  return period;
};
export const formatNHLQuarter = (period?: number | string) => {
  if (!period) return "";

  const p = Number(period);
  if (!isNaN(p)) {
    if (p <= 3) return ["1st", "2nd", "3rd"][p - 1];
    const otNumber = p - 3;
    return otNumber === 1 ? "OT" : `OT${otNumber}`;
  }

  // fallback for string values like "ot", "overtime"
  const val = String(period).toLowerCase();
  if (val.includes("ot") || val.includes("overtime")) {
    const match = val.match(/\d+/);
    return match ? `OT${match[0]}` : "OT";
  }

  return period;
};
export const formatMLBQuarter = (period?: number | string) => {
  if (!period) return "";

  const p = Number(period);
  if (!isNaN(p)) {
    if (p <= 3) return ["1st", "2nd", "3rd"][p - 1];
    const otNumber = p - 3;
    return otNumber === 1 ? "OT" : `OT${otNumber}`;
  }

  // fallback for string values like "ot", "overtime"
  const val = String(period).toLowerCase();
  if (val.includes("ot") || val.includes("overtime")) {
    const match = val.match(/\d+/);
    return match ? `OT${match[0]}` : "OT";
  }

  return period;
};

export const formatRound = (round?: number | string) => {
  if (!round) return "";

  const r = Number(round);
  if (isNaN(r)) return "";

  const rounds = ["1st", "2nd", "3rd", "4th", "5th"];

  return rounds[r - 1] ?? "";
};

export const formatCBBQuarter = (
  period?: number | string,
  isWomen?: boolean,
  statusText?: string,
) => {
  if (!period && !statusText) return "";

  if (typeof period === "string") {
    const val = period.toLowerCase();
    if (val.includes("ot")) return val.toUpperCase();
    if (val.includes("halftime")) return "Halftime";
    return val;
  }

  const p = Number(period);

  // ✅ WOMEN: 4 quarters
  if (isWomen) {
    if (p === 1) return "1st";
    if (p === 2) return "2nd";
    if (p === 3) return "3rd";
    if (p === 4) return "4th";

    const ot = p - 4;
    return ot === 1 ? "OT" : `${ot}OT`;
  }

  // ✅ MEN: 2 halves
  if (p === 1) return "1st";
  if (p === 2) return "2nd";

  const ot = p - 2;
  return ot === 1 ? "OT" : `${ot}OT`;
};

export function resolveVenue({
  espnVenue,
  homeTeam,
  isNeutralSite,
  league,
}: {
  espnVenue?: any;
  homeTeam?: any;
  isNeutralSite?: boolean;
  league?: string;
}) {
  const venueNameRaw =
    espnVenue?.fullName ?? espnVenue?.name ?? homeTeam?.venueName ?? "";

  const venueName = venueNameRaw.trim();
  const leagueKey = league?.toLowerCase();

  // -------------------------------------------------
  // 🔁 Select correct neutral venue map by league
  // -------------------------------------------------
  let neutralMap: Record<string, any> = {};

  switch (leagueKey) {
    case "nhl":
      neutralMap = nhlNeutralVenues;
      break;
    case "nfl":
      neutralMap = neutralStadiums;
      break;
    case "cfb":
      neutralMap = cfbNeutralStadiums;
      break;
    case "mlb":
      neutralMap = neutralVenues; // adjust if you add mlbNeutralVenues
      break;
    case "nba":
    default:
      neutralMap = neutralVenues;
  }

  // -------------------------------------------------
  // 1️⃣ Neutral site handling
  // -------------------------------------------------
  if (isNeutralSite && venueName) {
    const neutralMatch = Object.keys(neutralMap).find(
      (key) => key.toLowerCase().trim() === venueName.toLowerCase().trim(),
    );

    if (neutralMatch) {
      const neutralVenue = neutralMap[neutralMatch];

      return {
        name: neutralVenue.name ?? "",
        city: neutralVenue.city ?? "",
        address: neutralVenue.address ?? "",
        image: neutralVenue.venueImage ?? "",
        capacity: neutralVenue.venueCapacity ?? "",
        latitude: neutralVenue.latitude ?? null,
        longitude: neutralVenue.longitude ?? null,
      };
    }
  }

  // -------------------------------------------------
  // 2️⃣ Non-neutral → Prefer ESPN, fallback to homeTeam
  // -------------------------------------------------
  if (!isNeutralSite) {
    return {
      name: espnVenue?.fullName ?? espnVenue?.name ?? homeTeam?.venueName ?? "",
      city: espnVenue?.address?.city ?? homeTeam?.location ?? "",
      address: espnVenue?.address?.street ?? homeTeam?.address ?? "",
      image: homeTeam?.venueImage ?? espnVenue?.images?.[0]?.href ?? "",
      capacity: espnVenue?.capacity ?? homeTeam?.venueCapacity ?? "",
      latitude: espnVenue?.address?.latitude ?? homeTeam?.latitude ?? null,
      longitude: espnVenue?.address?.longitude ?? homeTeam?.longitude ?? null,
    };
  }

  // -------------------------------------------------
  // 3️⃣ Final fallback
  // -------------------------------------------------
  return {
    name: "",
    city: "",
    address: "",
    image: "",
    capacity: "",
    latitude: null,
    longitude: null,
  };
}


