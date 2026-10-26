import type {
  GameStatus,
  PlayObject,
} from "@/hooks/FootballHooks/useFootballGameDetails";

function getYardsToEndzone(value: unknown) {
  if (value == null || (typeof value === "string" && !value.trim())) {
    return null;
  }

  const yards = Number(value);
  return Number.isFinite(yards) ? yards : null;
}

export function isFootballRedZonePlay(
  play?: PlayObject | null,
  status?: Partial<GameStatus> | null,
) {
  if (!play || status?.state !== "in") return false;

  const statusText = [
    status.name,
    status.gameStatusDescription,
    status.gameStatusDetail,
    status.shortDetail,
  ].join(" ");

  if (/half[\s_-]*time/i.test(statusText)) return false;

  // Break events can retain the previous possession's field position.
  const playText = [
    play.type?.text,
    play.type?.abbreviation,
    play.text,
    play.shortText,
    play.description,
  ].join(" ");

  if (
    /\bend\s+(?:of\s+)?(?:the\s+)?(?:half|quarter|period)\b/i.test(playText)
  ) {
    return false;
  }

  const isInsideTwenty = [
    getYardsToEndzone(play.start?.yardsToEndzone),
    getYardsToEndzone(play.end?.yardsToEndzone),
  ].some((yards) => yards !== null && yards >= 0 && yards <= 20);

  const isGoalToGo = [
    play.start?.downDistanceText,
    play.start?.shortDownDistanceText,
    play.end?.downDistanceText,
    play.end?.shortDownDistanceText,
  ].some((text) => text?.toLowerCase().includes("goal"));

  return isInsideTwenty || isGoalToGo;
}
