import type { Play } from "hooks/BasketballHooks/useBasketballGameDetails";
import type { BasketballEventKind } from "types/basketball/visualizations";
import { validBasketballPosition } from "./basketballCourtGeometry";

export function basketballClockSeconds(clock?: string | null): number | null {
  if (typeof clock !== "string") return null;
  const match = (clock ?? "").match(/^(?:(\d{1,2}):)?(\d{1,2}(?:\.\d+)?)$/);
  if (!match || Number(match[2]) >= 60) return null;
  return Number(match[1] ?? 0) * 60 + Number(match[2]);
}

export function basketballElapsed(
  period: number,
  clock?: string | null,
): number | null {
  const remaining = basketballClockSeconds(clock);
  const duration = period <= 4 ? 720 : 300;
  if (
    !Number.isInteger(period) ||
    period < 1 ||
    period > 20 ||
    remaining === null ||
    remaining > duration
  )
    return null;
  return (
    Math.min(period - 1, 4) * 720 +
    Math.max(0, period - 5) * 300 +
    duration -
    remaining
  );
}

export function basketballPeriodLabel(period: number) {
  return period <= 4 ? `Q${period}` : period === 5 ? "OT" : `${period - 4}OT`;
}

export function basketballEventKey(play: Play) {
  if (play.id != null && String(play.id).trim()) return String(play.id);
  return JSON.stringify([
    play.period?.number,
    play.sequenceNumber,
    play.clock?.displayValue,
    play.type?.text,
    play.team?.id,
    play.homeScore,
    play.awayScore,
    play.text,
  ]);
}

/** Most recent correction for an id wins; chronology never depends on delivery order. */
export function orderedBasketballEvents(
  plays: readonly Play[] = [],
  lastPlay?: Play | null,
) {
  const byId = new Map<string, Play>();
  const input = Array.isArray(plays) ? plays : [];
  for (const play of lastPlay ? [...input, lastPlay] : input) {
    if (
      !play ||
      !Number.isInteger(Number(play.period?.number)) ||
      Number(play.period.number) < 1 ||
      Number(play.period.number) > 20
    )
      continue;
    byId.set(basketballEventKey(play), play);
  }
  return [...byId.values()].sort((a, b) => {
    const period = Number(b.period.number) - Number(a.period.number);
    if (period) return period;
    const aSequence = String(a.sequenceNumber ?? "").trim();
    const bSequence = String(b.sequenceNumber ?? "").trim();
    if (aSequence && bSequence) {
      const sequence = Number(bSequence) - Number(aSequence);
      if (Number.isFinite(sequence) && sequence !== 0) return sequence;
    }
    const aClock = basketballClockSeconds(a.clock?.displayValue);
    const bClock = basketballClockSeconds(b.clock?.displayValue);
    if (aClock !== null && bClock !== null && aClock !== bClock)
      return aClock - bClock;
    return basketballEventKey(b).localeCompare(
      basketballEventKey(a),
      undefined,
      { numeric: true },
    );
  });
}

export function classifyBasketballPlay(
  play?: Play | null,
): BasketballEventKind {
  if (!play) return "other";
  const type = play.type?.text ?? play.shortDescription ?? "";
  if (/free throw/i.test(type)) return "free-throw";
  if (/block/i.test(type) || /\bblocks\b|\bblocked\b/i.test(play.text ?? ""))
    return "block";
  if (/steal/i.test(type)) return "steal";
  if (/turnover|violation.*(?:8|24).*second/i.test(type)) return "turnover";
  if (/rebound/i.test(type)) return "rebound";
  if (/assist/i.test(type)) return "assist";
  if (/foul/i.test(type)) return "foul";
  if (play.shootingPlay === true) {
    if (!play.scoringPlay || !(play.scoreValue > 0)) return "miss";
    return play.scoreValue === 3 ? "made-three" : "made-two";
  }
  return "other";
}

export function basketballEventPresentation(play?: Play | null) {
  const kind = classifyBasketballPlay(play);
  const labels: Record<BasketballEventKind, string> = {
    "made-two": "Two-pointer",
    "made-three": "Three-pointer",
    miss: "Missed shot",
    "free-throw": "Free throw",
    rebound: "Rebound",
    assist: "Assist",
    steal: "Steal",
    turnover: "Turnover",
    block: "Block",
    foul: "Foul",
    other: "Play",
  };
  const isShot =
    ["made-two", "made-three", "miss", "free-throw"].includes(kind) ||
    (kind === "block" && play?.shootingPlay === true);
  return {
    kind,
    label: labels[kind],
    isShot,
    made: play?.scoringPlay === true && Number(play.scoreValue) > 0,
    points:
      play?.scoringPlay === true && Number(play.scoreValue) > 0
        ? Number(play.scoreValue)
        : 0,
    located: validBasketballPosition(play?.courtPosition),
    // Recorded assist labels never become invented pass paths or player movement.
    assisted: Boolean(
      (Array.isArray(play?.participants) &&
        play.participants.some((p) => /assist/i.test(p?.type ?? ""))) ||
        /\bassists\b/i.test(play?.text ?? ""),
    ),
    blocked: kind === "block",
    stolen: /\bsteals\b/i.test(play?.text ?? ""),
  };
}

export function basketballHistorySelection(
  events: readonly Play[],
  selectedKey: string | null,
) {
  const index =
    selectedKey === null
      ? 0
      : events.findIndex((p) => basketballEventKey(p) === selectedKey);
  const safeIndex = Math.max(0, index);
  return {
    play: events[safeIndex] ?? null,
    index: safeIndex,
    followingLatest: selectedKey === null || index < 0,
  };
}

export function relevantBasketballEvents(
  plays: readonly Play[] = [],
  lastPlay?: Play | null,
) {
  const ordered = orderedBasketballEvents(plays, lastPlay);
  const relevant = ordered.filter(
    (play) => classifyBasketballPlay(play) !== "other",
  );
  return relevant.length ? relevant : ordered.slice(0, 1);
}
