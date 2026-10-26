import type { Play } from "hooks/BasketballHooks/useBasketballGameDetails";
import type {
  BasketballChartPoint,
  BasketballWinProbability,
} from "types/basketball/visualizations";
import {
  basketballElapsed,
  basketballEventKey,
  orderedBasketballEvents,
} from "./basketballEvents";

export function basketballGameFlow(
  plays: readonly Play[],
): BasketballChartPoint[] {
  const points: BasketballChartPoint[] = [];
  for (const play of orderedBasketballEvents(plays).reverse()) {
    const seconds = basketballElapsed(
      Number(play.period?.number),
      play.clock?.displayValue,
    );
    if (
      seconds === null ||
      play.scoringPlay !== true ||
      !Number.isSafeInteger(play.homeScore) ||
      !Number.isSafeInteger(play.awayScore) ||
      play.homeScore < 0 ||
      play.awayScore < 0
    )
      continue;
    points.push({
      key: basketballEventKey(play),
      seconds,
      period: Number(play.period.number),
      clock: play.clock.displayValue,
      home: play.homeScore - play.awayScore,
      away: play.awayScore - play.homeScore,
      homeScore: play.homeScore,
      awayScore: play.awayScore,
      description: play.text || play.type?.text || "Scoring play",
    });
  }
  return points.sort((a, b) => a.seconds - b.seconds);
}

export function basketballProbabilityHistory(
  history: readonly BasketballWinProbability[] = [],
): BasketballChartPoint[] {
  if (!Array.isArray(history)) return [];
  const points = new Map<string, BasketballChartPoint>();
  for (const sample of history) {
    if (!sample) continue;
    const seconds = basketballElapsed(sample.period, sample.clock);
    if (
      seconds === null ||
      !Number.isFinite(sample.homeProbability) ||
      !Number.isFinite(sample.awayProbability) ||
      sample.homeProbability < 0 ||
      sample.homeProbability > 1 ||
      sample.awayProbability < 0 ||
      sample.awayProbability > 1 ||
      Math.abs(sample.homeProbability + sample.awayProbability - 1) > 0.001 ||
      !sample.playId
    )
      continue;
    points.set(sample.playId, {
      key: sample.playId,
      seconds,
      period: sample.period,
      clock: sample.clock,
      home: sample.homeProbability * 100,
      away: sample.awayProbability * 100,
      description: "Recorded win probability",
    });
  }
  return [...points.values()].sort((a, b) => a.seconds - b.seconds);
}

export function basketballPeriodBoundaries(periods: number) {
  return Array.from(
    { length: Math.min(Math.max(4, periods), 20) + 1 },
    (_, i) => (i <= 4 ? i * 720 : 2880 + (i - 4) * 300),
  );
}

export function nearestBasketballChartPoint(
  points: readonly BasketballChartPoint[],
  seconds: number,
) {
  let low = 0,
    high = points.length - 1;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (points[mid].seconds < seconds) low = mid + 1;
    else high = mid;
  }
  if (!points.length) return null;
  const left = points[Math.max(0, low - 1)],
    right = points[low];
  return seconds - left.seconds < right.seconds - seconds ? left : right;
}

/** Step paths preserve observed changes; no interpolated probability observations. */
export function basketballStepPath(
  points: readonly BasketballChartPoint[],
  team: "home" | "away",
  x: (seconds: number) => number,
  y: (value: number) => number,
) {
  return points
    .map(
      (point, i) =>
        `${i ? "H" : "M"}${x(point.seconds).toFixed(2)}${i ? "V" : " "}${y(point[team]).toFixed(2)}`,
    )
    .join(" ");
}
