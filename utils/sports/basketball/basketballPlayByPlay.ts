import type {
  GameStatus,
  Play,
} from "hooks/BasketballHooks/useBasketballGameDetails";

import {
  basketballArc,
  basketballBasketPoint,
  projectBasketballCourtPoint,
  validBasketballPosition,
} from "./basketballCourtGeometry";
import { orderedBasketballEvents } from "./basketballEvents";
export {
  BASKETBALL_RIM_HEIGHT,
  projectBasketballCourtPoint,
} from "./basketballCourtGeometry";

export { orderedBasketballEvents as sortBasketballPlays } from "./basketballEvents";

export function latestBasketballPlay(
  plays: readonly Play[] = [],
  lastPlay?: Play | null,
) {
  return orderedBasketballEvents(plays, lastPlay)[0] ?? null;
}

export function basketballPlayLocation(play?: Play | null) {
  const point = play?.courtPosition;
  return validBasketballPosition(point)
    ? projectBasketballCourtPoint(point.x, point.y)
    : null;
}

/** A schematic shot arc, using only the backend's normalized court position. */
export function basketballShotTrajectory(
  play: Play | null | undefined,
  homeId: string | number,
  awayId: string | number,
) {
  const start = basketballPlayLocation(play);
  if (!start || play?.shootingPlay !== true || play.team?.id == null)
    return null;

  const teamId = String(play.team.id);
  const isHome = teamId === String(homeId);
  if (!isHome && teamId !== String(awayId)) return null;

  return basketballArc(start, basketballBasketPoint(isHome));
}

export function isBasketballPlayLive(
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
    !/half[\s_-]*time|intermission|end[\s_-]*(?:of[\s_-]*(?:the[\s_-]*)?)?(?:period|quarter|game)|final|suspended|delayed/i.test(
      labels,
    )
  );
}
