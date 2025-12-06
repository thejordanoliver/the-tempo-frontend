// utils/nflGameCardUtils.ts
import { getTeamName, getNFLTeamsLogo, getTeamCode } from "constants/teamsNFL";

/**
 * Format date from timestamp (seconds → readable date)
 */
export const getGameDate = (timestamp?: number | null) => {
  if (!timestamp) return { date: null, iso: "", formattedDate: "", formattedTime: "" };

  const date = new Date(timestamp * 1000);
  const iso = date.toISOString();

  return {
    date,
    iso,
    formattedDate: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    formattedTime: date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

/**
 * Determine if the game is a Super Bowl
 */
export const isSuperBowlGame = (game: any, date?: Date | null) => {
  return (
    game?.game?.week === "Super Bowl" ||
    (date?.getMonth() === 1 && date?.getDate() >= 2)
  );
};

/**
 * Compute the normalized status info (Final, Live, etc.)
 */
export const getNFLGameStatus = (game: any) => {
  const long = game.game.status.long ?? "";
  const short = game.game.status.short?.toLowerCase() ?? "";
  const longLower = long.toLowerCase();

  const wentOT =
    longLower.includes("ot") ||
    longLower.includes("overtime") ||
    short.includes("ot");

  const isFinal =
    longLower === "final" ||
    longLower === "finished" ||
    longLower.includes("final") ||
    longLower.includes("finished") ||
    longLower.includes("after over") ||
    longLower.includes("aot") ||
    short.includes("ft");

  // ✅ New logic: label “after overtime” as Final/OT instead of Final
  const displayStatus =
    longLower.includes("after over") || longLower.includes("after overtime")
      ? "Final/OT"
      : longLower.includes("final")
      ? "Final"
      : long;

  const live = ![
    "not started",
    "final",
    "finished",
    "canceled",
    "delayed",
    "postponed",
    "halftime",
  ].includes(longLower);

  return {
    isScheduled: longLower === "not started",
    isFinal,
    wentOT,
    isCanceled: longLower === "canceled",
    isDelayed: longLower === "delayed",
    isPostponed: longLower === "postponed",
    isHalftime: longLower === "halftime",
    isLive: live && !isFinal,
    short: game.game.status.short,
    long: displayStatus, // ✅ now shows “Final/OT” when applicable
    timer: game.game.status.timer,
  };
};

/**
 * Normalize display status for consistency
 */
export const normalizeDisplayStatus = (
  base?: string | null
): string => {
  if (!base) return "Scheduled";
  const val = base.toLowerCase();
  if (val === "finished") return "Final";
  if (val.includes("postponed")) return "Postponed";
  if (val.includes("canceled")) return "Canceled";
  return base;
};

/**
 * Format quarter / period display
 */
export const formatQuarter = (
  short?: string | null,
  long?: string | null
): string => {
  const val = short && short.trim() !== "" ? short : long ?? "";
  if (!val) return "";

  const q = val.toLowerCase();
  if (q.includes("1")) return "1st";
  if (q.includes("2")) return "2nd";
  if (q.includes("3")) return "3rd";
  if (q.includes("4")) return "4th";
  if (q.includes("ot") || q.includes("overtime")) return "OT";
  if (q.includes("half")) return "Halftime";
  if (q.includes("end")) return "End";

  const asNumber = Number(val);
  if (!isNaN(asNumber)) {
    if (asNumber === 5) return "OT";
    if (asNumber > 5) return `${asNumber - 4}OT`;
  }

  return val;
};

/**
 * Format team object with memoized fields
 */
export const getNFLTeamData = (
  id: string | number | undefined,
  espnID: string | number | undefined,
  dark: boolean,
  record: string,
  possessionTeamId?: string | number
): {
  logo: any;
  name: string;
  code: string | null;
  record: string;
  id: string | number | undefined;
  espnID: string | number | undefined;
  hasPossession: boolean;
} => ({
  logo: getNFLTeamsLogo(String(id ?? ""), dark),
  name: getTeamName(String(id ?? ""), "Team"),
  code: getTeamCode(String(id ?? "")),
  record,
  id,
  espnID,
  hasPossession: String(possessionTeamId ?? "") === String(id ?? ""),
});


/**
 * Determine winner/loser text color
 */
export const getTeamTextStyle = (
  isHome: boolean,
  dark: boolean,
  status: any,
  scores: any,
  isSuperBowl: boolean
) => {
  const homeScore = scores.home?.total ?? 0;
  const awayScore = scores.away?.total ?? 0;
  let isWinner = true;
  if (status.isFinal && homeScore !== awayScore) {
    isWinner = isHome ? homeScore > awayScore : awayScore > homeScore;
  }

  if (isSuperBowl) {
    return {
      color: "#1d1d1d",
      opacity: isWinner ? 1 : 0.5,
    };
  }

  return {
    color: dark ? "#fff" : "#1d1d1d",
    opacity: isWinner ? 1 : 0.5,
  };
};
