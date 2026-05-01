// utils/games.ts
import { neutralStadiums, neutralVenues } from "constants/neutralVenues";
import { neutralStadiums as cfbNeutralStadiums } from "constants/teamsCFB";
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

type VenueSource = {
  venue?: string | null;
  name?: string | null;
  city?: string | null;
  address?: string | null;
  venueCapacity?: number | string | null;
  venue_capacity?: number | string | null;
  venueImage?: string | null;
  venue_image?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

type ResolveVenueParams = {
  venue?: any;
  homeTeam?: any;
  matchedVenue?: VenueSource | null;
  neutralSite?: boolean;
  neutralStadiums: Record<string, any>;
};

export const normalizeGames = (
  games: any[],
  leagueType: string,
  isWomen = false,
) =>
  games
    .map((game: any) => {
      let date: dayjs.Dayjs | null = null;

      if (leagueType === "CFB" || leagueType === "NFL") {
        const ts = game.game?.date?.timestamp;
        if (!ts) return null;
        date = dayjs.unix(ts).local();
      } else {
        const raw =
          game.date?.start ?? game.date?.date ?? game.date ?? game.game?.date;
        if (!raw) return null;
        date = dayjs.utc(raw).local();
      }

      let home, away;

      if (leagueType === "NBA") {
        home = { ...game.home, id: String(game.home?.id) };
        away = {
          ...game.away,
          id: String(game.away?.id),
        };
      } else if (leagueType === "NFL" || leagueType === "CFB") {
        home = { ...game.teams?.home, id: String(game.teams?.home?.id) };
        away = { ...game.teams?.away, id: String(game.teams?.away?.id) };
      } else if (leagueType === "MLB") {
        home = {
          id: game.teams?.home?.id,
          name: game.teams?.home?.name,
        };

        away = {
          id: game.teams?.away?.id,
          name: game.teams?.away?.name,
        };
      } else {
        home = normalizeTeam(game.teams?.home, isWomen);
        away = normalizeTeam(game.teams?.away, isWomen);
      }

      return {
        ...game,
        date: date.toDate(),
        dateString: date.format("YYYY-MM-DD"),
        time: date.format("h:mm A"),
        home,
        away,
      };
    })
    .filter(Boolean);

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
    case "cbb":
    case "wcbb":
      neutralMap = neutralVenues;
      break;
    case "mlb":
      neutralMap = neutralVenues;
      break;
    case "nba":
    default:
      neutralMap = neutralVenues;
      break;
  }

  // -------------------------------------------------
  // Normalize ESPN venue (handles CBB + NBA differences)
  // -------------------------------------------------
  const venueNameRaw =
    espnVenue?.fullName ?? espnVenue?.name ?? homeTeam?.venueName ?? "";

  const venueName = venueNameRaw.trim();

  const normalizedCity =
    espnVenue?.address?.city && espnVenue?.address?.state
      ? `${espnVenue.address.city}, ${espnVenue.address.state}`
      : (homeTeam?.location ?? "");

  const normalizedAddress =
    homeTeam?.address ??
    espnVenue?.address?.street ??
    espnVenue?.address?.city ??
    "";

  const normalizedImage =
    homeTeam?.venueImage ?? espnVenue?.images?.[0]?.href ?? "";

  const normalizedCapacity =
    espnVenue?.capacity ?? homeTeam?.venueCapacity ?? "";

  // ⚠️ ESPN CBB DOES NOT PROVIDE LAT/LNG
  const normalizedLat =
    espnVenue?.address?.latitude ?? homeTeam?.latitude ?? null;

  const normalizedLng =
    espnVenue?.address?.longitude ?? homeTeam?.longitude ?? null;

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
        name: neutralVenue.name ?? venueName,
        city: neutralVenue.city ?? normalizedCity,
        address: neutralVenue.address ?? normalizedAddress,
        image: neutralVenue.venueImage ?? normalizedImage,
        capacity: neutralVenue.venueCapacity ?? normalizedCapacity,
        latitude: neutralVenue.latitude ?? normalizedLat,
        longitude: neutralVenue.longitude ?? normalizedLng,
      };
    }
  }

  // -------------------------------------------------
  // 2️⃣ Standard venue (ESPN → fallback to team)
  // -------------------------------------------------
  if (venueName || homeTeam) {
    return {
      name: venueName,
      city: normalizedCity,
      address: normalizedAddress,
      image: normalizedImage,
      capacity: normalizedCapacity,
      latitude: normalizedLat,
      longitude: normalizedLng,
    };
  }

  // -------------------------------------------------
  // 3️⃣ Final fallback (safe empty object)
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

export const normalizeVenueName = (name?: string | null) =>
  name
    ?.toLowerCase()
    .replace(/stadium|field|arena|center|centre/g, "")
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim() ?? "";

export const findMatchedVenue = (
  venueName: string | undefined,
  venues: VenueSource[],
) => {
  if (!venueName) return null;

  const normalized = normalizeVenueName(venueName);

  return venues.find((v) => normalizeVenueName(v.venue) === normalized) ?? null;
};

export const resolveFootballVenue = ({
  venue,
  homeTeam,
  matchedVenue,
  neutralSite,
  neutralStadiums,
}: ResolveVenueParams) => {
  const normalizedVenueName = venue?.name?.trim().toLowerCase() ?? "";

  const neutralEntry = Object.entries(neutralStadiums).find(
    ([name]) => name.trim().toLowerCase() === normalizedVenueName,
  );

  const neutralData = neutralEntry ? neutralEntry[1] : null;
  const neutralName = neutralEntry ? neutralEntry[0] : null;

  let resolved = {
    name:
      matchedVenue?.venue ??
      venue?.name ??
      homeTeam?.venue ??
      "Unknown Stadium",

    city: matchedVenue?.city ?? homeTeam?.city ?? "Unknown City",

    address: matchedVenue?.address ?? homeTeam?.address ?? "",

    capacity:
      matchedVenue?.venue_capacity ?? homeTeam?.venueCapacity?.toString() ?? "",

    image:
      matchedVenue?.venue_image ?? venue?.image ?? homeTeam?.venueImage ?? null,

    lat: matchedVenue?.latitude ?? homeTeam?.latitude ?? null,

    lon: matchedVenue?.longitude ?? homeTeam?.longitude ?? null,
  };

  if (neutralSite && neutralData) {
    resolved = {
      name: neutralName ?? resolved.name,
      city: neutralData.city ?? resolved.city,
      address: neutralData.address ?? resolved.address,
      capacity: neutralData.venueCapacity?.toString() ?? resolved.capacity,
      image: neutralData.venueImage ?? resolved.image,
      lat: neutralData.latitude ?? resolved.lat,
      lon: neutralData.longitude ?? resolved.lon,
    };
  }

  return resolved;
};
