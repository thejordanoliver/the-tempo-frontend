import type { CourtPoint } from "types/basketball/visualizations";

export const COURT_LENGTH = 94;
export const COURT_WIDTH = 50;
export const BASKETBALL_RIM_HEIGHT = 70;

export function validBasketballPosition(
  point?: CourtPoint | null,
): point is CourtPoint {
  return Boolean(
    point &&
      Number.isFinite(point.x) &&
      Number.isFinite(point.y) &&
      point.x >= 0 &&
      point.x <= COURT_LENGTH &&
      point.y >= 0 &&
      point.y <= COURT_WIDTH,
  );
}

/** Project normalized feet onto the same perspective used by the court surface. */
export function projectBasketballCourtPoint(x: number, y: number): CourtPoint {
  const depth = y / COURT_WIDTH;
  const farToNear = 860 / 960;
  const perspective = 1 / (1 - (1 - farToNear) * depth);
  return {
    x: 500 + ((x - 47) / COURT_LENGTH) * 860 * perspective,
    y: 36 + 204 * farToNear * depth * perspective,
  };
}

export function basketballBasketPoint(home: boolean): CourtPoint {
  return projectBasketballRaisedPoint(
    home ? 88.75 : 5.25,
    25,
    BASKETBALL_RIM_HEIGHT,
  );
}

/** Raised objects lean outward in the same perspective as the floor. */
export function projectBasketballRaisedPoint(
  x: number,
  y: number,
  elevation: number,
): CourtPoint {
  const floor = projectBasketballCourtPoint(x, y);
  return {
    x: floor.x + ((x - 47) / 47) * elevation * 0.45,
    y: floor.y - elevation,
  };
}

export function basketballArc(start: CourtPoint, end: CourtPoint) {
  const lift = Math.min(100, Math.max(36, Math.abs(end.x - start.x) * 0.48));
  const lowestEndpoint = Math.min(start.y, end.y);
  const apex = Math.min(lowestEndpoint, Math.max(2, lowestEndpoint - lift));
  const control = {
    x: (start.x + end.x) / 2,
    // Reach the chosen apex without clipping at steep shooting angles.
    y: apex - Math.sqrt((start.y - apex) * (end.y - apex)),
  };
  return {
    start,
    control,
    end,
    path: `M${start.x} ${start.y} Q${control.x} ${control.y} ${end.x} ${end.y}`,
  };
}

export function basketballCourtViewport(layout: "full" | "half", home = true) {
  return layout === "full"
    ? { viewBox: "-20 -8 1040 266", aspectRatio: 1040 / 266 }
    : { viewBox: `${home ? 500 : -20} -8 520 266`, aspectRatio: 520 / 266 };
}
