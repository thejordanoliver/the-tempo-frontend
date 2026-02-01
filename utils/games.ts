// utils/games.ts
import { neutralVenues } from "constants/teams";
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

// --- Helpers ---
export const formatCBBQuarter = (
  period?: number | string,
  isWomen?: boolean,
  statusText?: string
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
}: {
  espnVenue?: any;
  homeTeam?: any;
  isNeutralSite?: boolean;
}) {
  const venueName =
    espnVenue?.fullName ?? espnVenue?.name ?? homeTeam?.venueName ?? "";

  // 1️⃣ Exact neutral venue match
  const neutralVenue = neutralVenues[venueName];
  if (neutralVenue) {
    return {
      name: neutralVenue.name,
      city: neutralVenue.city ?? "",
      address: neutralVenue.address ?? "",
      image: neutralVenue.venueImage ?? "",
      capacity: neutralVenue.venueCapacity ?? "",
      latitude: neutralVenue.latitude ?? null,
      longitude: neutralVenue.longitude ?? null,
    };
  }

  // 2️⃣ Prefer TEAM venue for non-neutral games
  if (!isNeutralSite && homeTeam?.address) {
    return {
      name: homeTeam.venueName ?? "",
      city: homeTeam.location ?? "",
      address: homeTeam.address ?? "",
      image: homeTeam.venueImage ?? "",
      capacity: homeTeam.venueCapacity ?? "",
      latitude: homeTeam.latitude ?? null,
      longitude: homeTeam.longitude ?? null,
    };
  }

  // 3️⃣ ESPN fallback
  if (espnVenue) {
    return {
      name: espnVenue.fullName ?? espnVenue.name ?? "",
      city: espnVenue.address?.city ?? "",
      address: espnVenue.address?.street ?? "",
      image: espnVenue.images?.[0]?.href ?? "", // ✅ this is valid
      capacity: espnVenue.capacity ?? "",
      latitude: espnVenue.latitude ?? null,
      longitude: espnVenue.longitude ?? null,
    };
  }

  // 4️⃣ Default fallback
  return {
    name: "",
    city: "",
    address: "",
    image: "", // will never happen if espnVenue exists
    capacity: "",
    latitude: null,
    longitude: null,
  };
}
