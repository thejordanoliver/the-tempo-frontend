// utils/games.ts
import { neutralVenues } from "constants/neutralVenues";

import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
dayjs.extend(utc);
dayjs.extend(timezone);

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

export const normalizeGames = (games: any[], leagueType: string) =>
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
        home = { ...game.home };
        away = { ...game.away };
      } else if (leagueType === "NFL" || leagueType === "CFB") {
        home = { ...game.teams?.home };
        away = { ...game.teams?.away };
      } else if (leagueType === "MLB") {
        home = { ...game.home };
        away = { ...game.away };
      } else if (leagueType === "NHL") {
        home = { ...game.home };
        away = { ...game.away };
      } else if (leagueType === "CB") {
        home = { ...game.home };
        away = { ...game.away };
      } else if (leagueType === "SB") {
        home = { ...game.home };
        away = { ...game.away };
      } else if (leagueType === "CBB") {
        home = { ...game.teams?.home };
        away = { ...game.teams?.away };
      } else if (leagueType === "WCBB") {
        home = { ...game.teams?.home };
        away = { ...game.teams?.away };
      } else if (leagueType === "WNBA") {
        home = { ...game.teams?.home };
        away = { ...game.teams?.away };
      } else {
        home = null;
        away = null;
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
export function normalizeTeam(team: any, isWomen = false) {
  if (!team) return null;

  return {
    ...team,
    id: isWomen
      ? String(team.wid ?? team.id) // 👈 WCBB uses wid
      : String(team.id),
  };
}

// ----------  Live Game ----------
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

export const formatQuarter = (
  period?: number | string,
  isCBB?: boolean,
  isNHL?: boolean,
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

  // ✅ MEN: 2 halves
  if (isCBB) {
    if (p === 1) return "1st";
    if (p === 2) return "2nd";

    const ot = p - 2;
    return ot === 1 ? "OT" : `${ot}OT`;
  }

  if (isNHL) {
    if (p === 1) return "1st";
    if (p === 2) return "2nd";
    if (p === 3) return "3rd";

    const ot = p - 3;
    return ot === 1 ? "OT" : `${ot}OT`;
  }

  if (p === 1) return "1st";
  if (p === 2) return "2nd";
  if (p === 3) return "3rd";
  if (p === 4) return "4th";

  const ot = p - 4;
  return ot === 1 ? "OT" : `${ot}OT`;
};

export const formatRound = (round?: number | string) => {
  if (!round) return "";

  const r = Number(round);
  if (isNaN(r)) return "";

  const rounds = ["1st", "2nd", "3rd", "4th", "5th"];

  return rounds[r - 1] ?? "";
};

// ---------- Venue----------
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
      neutralMap = neutralVenues;
      break;
    case "nfl":
      neutralMap = neutralVenues;
      break;
    case "cfb":
      neutralMap = neutralVenues;
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

export const formatVenueAddress = (address?: {
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}) => {
  if (!address) return undefined;

  return [address.city, address.state, address.zipCode, address.country]
    .filter(Boolean)
    .join(" ");
};

// ---------- Broadcast ----------
export function getBroadcastDisplay(broadcasts?: string[]) {
  if (!broadcasts?.length) return "";

  const allNames = broadcasts.map((n) => n.toLowerCase()).filter(Boolean);

  const networkMap: [string, string][] = [
    ["espn2", "ESPN2"],
    ["espn3", "ESPN3"],
    ["espn+", "ESPN+"],
    ["espnu", "ESPNU"],
    ["sec network", "SECN"],
    ["secn+", "SECN+"],
    ["acc network", "ACCN"],
    ["abc", "ABC"],
    ["tnt", "TNT"],
    ["btn", "BTN"],
    ["tbs", "TBS"],
    ["fox sports", "FS1"],
    ["fs1", "FS1"],
    ["fox", "FOX"],
    ["cbs", "CBS"],
    ["peacock", "Peacock"],
    ["nbc", "NBC"],
    ["netflix", "Netflix"],
    ["prime video", "Prime"],
    ["amazon", "Prime"],
    ["nba league pass", "NBA League Pass"],
    ["nba tv", "NBA TV"],
    ["hbo max", "MAX"],
    ["max", "MAX"],
    ["espn", "ESPN"],
  ];

  // special combos
  if (
    allNames.some((n) => n.includes("abc")) &&
    allNames.some((n) => n.includes("espn"))
  )
    return "ABC/ESPN";
  if (
    allNames.some((n) => n.includes("nbc")) &&
    allNames.some((n) => n.includes("peacock"))
  )
    return "NBC/Peacock";
  if (
    allNames.some((n) => n.includes("tnt")) &&
    allNames.some((n) => n.includes("max"))
  )
    return "TNT/MAX";

  for (const [key, value] of networkMap) {
    if (allNames.some((n) => n.includes(key))) {
      return value;
    }
  }

  // fallback
  const first = broadcasts[0];
  return first ? first.replace(/\b\w/g, (c) => c.toUpperCase()) : "";
}
