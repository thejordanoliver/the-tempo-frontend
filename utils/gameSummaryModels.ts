import type { Play as BasketballPlay } from "hooks/BasketballHooks/useBasketballGameDetails";
import type { Play as HockeyPlay } from "hooks/HockeyHooks/useHockeyGameDetails";
import type { FootballSummaryPlay } from "./footballSummary";
import type { GameSummaryModel, SummaryPlay } from "types/gameSummary";
import { getGameSummaryPeriods } from "./gameSummaryPeriods";
import { sortHockeySummaryPlays } from "./hockeySummary";

type RowInput = {
  id: string; text?: string | null; period?: { number?: number | string | null } | null;
  clock?: { displayValue?: string | null } | null; team?: { id?: string | number | null } | null;
  scoringPlay?: boolean | null; awayScore?: string | number | null; homeScore?: string | number | null;
};

function row(play: RowInput, periodLabel: string, eventLabel: string): SummaryPlay {
  return { id: play.id, period: { number: Number(play.period?.number) }, periodLabel,
    clock: play.clock?.displayValue || "–", teamId: play.team?.id, text: play.text ?? "",
    eventLabel, scoring: play.scoringPlay === true, awayScore: play.awayScore, homeScore: play.homeScore };
}

export function basketballSummaryModel(input: readonly BasketballPlay[], league: string): GameSummaryModel {
  const halves = league.toLowerCase() === "mcbb";
  const labels = halves ? ["1st Half", "2nd Half"] : ["1st", "2nd", "3rd", "4th"];
  const sorted = input.filter(play => Number.isInteger(Number(play.period?.number)) && Number(play.period?.number) > 0)
    .map((play, index) => ({ play, index }))
    .sort((a, b) => {
      const period = Number(b.play.period.number) - Number(a.play.period.number);
      if (period) return period;
      const sequence = Number(b.play.sequenceNumber) - Number(a.play.sequenceNumber);
      if (Number.isFinite(sequence) && sequence !== 0) return sequence;
      const seconds = (clock: string) => {
        const [minutes, seconds] = clock.split(":").map(Number);
        return Number.isFinite(minutes) && Number.isFinite(seconds)
          ? minutes * 60 + seconds
          : NaN;
      };
      const clock = seconds(a.play.clock?.displayValue ?? "") - seconds(b.play.clock?.displayValue ?? "");
      return Number.isFinite(clock) && clock !== 0 ? clock : b.index - a.index;
    })
    .map(({ play }) => play);
  const periods = getGameSummaryPeriods(sorted, labels);
  return { periods, plays: sorted.map(play => row(play,
    periods.find(tab => tab.number === Number(play.period.number))?.label ?? "–",
    play.scoringPlay && play.scoreValue > 0 ? `+${play.scoreValue} PTS` : play.type?.text || "Play")) };
}

export function hockeySummaryModel(input: readonly HockeyPlay[]): GameSummaryModel {
  const sorted = sortHockeySummaryPlays(input);
  const periods = getGameSummaryPeriods(sorted, ["1st", "2nd", "3rd"]);
  return { periods, plays: sorted.map(play => {
    const number = Number(play.period.number);
    const label = periods.find(tab => tab.number === number)?.label ?? "–";
    return row(play, number <= 3 ? `P${number}` : label, play.scoringPlay ? "GOAL" : play.type?.text || "Play");
  }) };
}

export function footballSummaryModel(input: readonly FootballSummaryPlay[]): GameSummaryModel {
  const periods = getGameSummaryPeriods(input, ["1st", "2nd", "3rd", "4th"]);
  return { periods, plays: input.map(play => {
    const number = Number(play.period?.number);
    const label = periods.find(tab => tab.number === number)?.label ?? "–";
    const event = play.scoringPlay ? play.scoringType?.displayName ?? play.type?.text ?? "Score" : play.type?.text ?? "Play";
    const down = play.start?.shortDownDistanceText ?? play.start?.downDistanceText;
    return row(play, number <= 4 ? `Q${number}` : label, down && !play.scoringPlay ? `${down} · ${event}` : event);
  }) };
}
