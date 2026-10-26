import type { GameStatus, Play } from "hooks/HockeyHooks/useHockeyGameDetails";
import { sortHockeySummaryPlays } from "./hockeySummary";

export function latestHockeyPlay(plays: Play[] = [], lastPlay?: Play | null) {
  return lastPlay ?? sortHockeySummaryPlays(plays)[0] ?? null;
}

export function projectHockeyRinkPoint(x: number, y: number) {
  const depth = (42.5 - y) / 85;
  // A tilted plane: the near boards are wider and the far half recedes.
  // Use this projection for both the ice markings and event locations.
  const perspective = 1 / (1 - 0.14 * depth);
  return {
    x: 500 + x * 4.3 * perspective,
    y: 20 + 220 * 0.86 * depth * perspective,
  };
}

export function hockeyPlayLocation(play?: Play | null) {
  const x = play?.coordinate?.x;
  const y = play?.coordinate?.y;
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    Math.abs(x) > 100 ||
    Math.abs(y) > 42.5
  )
    return null;
  return projectHockeyRinkPoint(x, y);
}

export function isHockeyPlayLive(
  state?: string | null,
  status?: Partial<GameStatus> | null,
) {
  const labels = [
    status?.name,
    status?.gameStatusDescription,
    status?.gameStatusDetail,
    status?.shortDetail,
  ].join(" ");
  return (
    state === "in" &&
    !/intermission|end[\s_-]*(?:of[\s_-]*)?period|final|suspended|delayed/i.test(
      labels,
    )
  );
}
