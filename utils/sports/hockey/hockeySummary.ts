import type { Play } from "hooks/HockeyHooks/useHockeyGameDetails";

export const hockeyPeriodTabs = ["All", "1st", "2nd", "3rd", "OT"] as const;
export type HockeySummaryPeriod = (typeof hockeyPeriodTabs)[number];

function clockSeconds(clock?: string) {
  const [minutes, seconds] = (clock ?? "").split(":").map(Number);
  return Number.isFinite(minutes) && Number.isFinite(seconds)
    ? minutes * 60 + seconds
    : NaN;
}

export function sortHockeySummaryPlays(plays: readonly Play[]) {
  return plays
    .filter((play) => play.period?.number > 0)
    .map((play, index) => ({
      play,
      index,
      seconds: clockSeconds(play.clock?.displayValue),
    }))
    .sort((a, b) => {
      const period = b.play.period.number - a.play.period.number;
      if (period) return period;
      const sequence =
        Number(b.play.sequenceNumber) - Number(a.play.sequenceNumber);
      if (Number.isFinite(sequence) && sequence !== 0) return sequence;
      const clock = a.seconds - b.seconds;
      return Number.isFinite(clock) && clock !== 0 ? clock : b.index - a.index;
    })
    .map(({ play }) => play);
}

export function filterHockeySummaryPlays(
  plays: Play[],
  period: HockeySummaryPeriod,
) {
  if (period === "All") return plays;
  if (period === "OT") return plays.filter((play) => play.period.number >= 4);
  const number = Number(period[0]);
  return plays.filter((play) => play.period.number === number);
}
