import type { SummaryPeriodTab } from "utils/games/gameSummaryPeriods";

export type SummaryPlay = {
  id: string;
  period: { number: number };
  periodLabel: string;
  clock: string;
  teamId?: string | number | null;
  text: string;
  eventLabel: string;
  scoring: boolean;
  awayScore?: string | number | null;
  homeScore?: string | number | null;
};

export type GameSummaryModel = {
  plays: SummaryPlay[];
  periods: SummaryPeriodTab[];
};
