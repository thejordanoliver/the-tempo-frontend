import type { Play } from "hooks/BasketballHooks/useBasketballGameDetails";
import { basketballEventPresentation } from "./basketballEvents";
import {
  basketballArc,
  basketballBasketPoint,
  projectBasketballCourtPoint,
  validBasketballPosition,
} from "./basketballCourtGeometry";

export function basketballAnimationScene(
  play: Play | null | undefined,
  homeId: string | number,
  awayId: string | number,
) {
  const event = basketballEventPresentation(play);
  const team = play?.team?.id == null ? "" : String(play.team.id);
  const home = team === String(homeId);
  const knownTeam = home || team === String(awayId);
  const position = play?.courtPosition;
  const located = validBasketballPosition(position);
  const three = event.kind === "made-three" || play?.pointsAttempted === 3;
  const genericX = event.kind === "free-throw" ? 75 : three ? 63 : 78;
  const point = located
    ? projectBasketballCourtPoint(position.x, position.y)
    : event.isShot && knownTeam
      ? projectBasketballCourtPoint(home ? genericX : 94 - genericX, 25)
      : null;
  const trajectory =
    event.isShot && knownTeam && point
      ? basketballArc(point, basketballBasketPoint(home))
      : null;
  return {
    ...event,
    home,
    knownTeam,
    point,
    trajectory,
    locationLabel: located
      ? event.kind === "rebound"
        ? "Last shot location"
        : event.isShot
          ? "Reported shot location · Illustrative arc"
          : "Reported event location"
      : event.kind === "other"
        ? "Location unavailable"
        : "Illustrative · Location unavailable",
  };
}
