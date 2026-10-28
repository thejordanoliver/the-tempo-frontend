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
  const atFreeThrowLine = event.kind === "free-throw" && knownTeam;
  const three = event.kind === "made-three" || play?.pointsAttempted === 3;
  const genericX = three ? 63 : 78;
  // A free throw has a fixed court position even when the feed omits coordinates.
  const point = atFreeThrowLine
    ? projectBasketballCourtPoint(home ? 75 : 19, 25)
    : located
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
    atFreeThrowLine,
    point,
    trajectory,
    locationLabel: atFreeThrowLine
      ? "Free-throw line · Illustrative arc"
      : located
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
