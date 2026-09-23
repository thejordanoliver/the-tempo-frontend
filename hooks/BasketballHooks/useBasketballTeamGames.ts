import type { BasketballGame } from "@/types/basketball/basketball";
import { isAxiosError } from "axios";
import { useMonthlyTeamSchedule } from "hooks/Sports/useTeamSchedule";
import type { ScheduleMonthGroup, ScheduleMonthKey, ScheduleMonthOption } from "types/schedule";

export type BasketballTeamScheduleLeague = "nba" | "gleague" | "wnba" | "cbb" | "wcbb";
export type BasketballScheduleMonth = ScheduleMonthGroup<BasketballGame>;
export type BasketballTeamScheduleTeam = {
  id?: string; code?: string; location?: string; name?: string;
  displayName?: string; logo?: string; recordSummary?: string;
  seasonSummary?: string; standingSummary?: string; groups?: any;
};
type Season = { year: number; type: number; name: string; displayName: string; half: number };
export type BasketballTeamScheduleResponse = {
  league: string; team: BasketballTeamScheduleTeam | null; season: Season;
  games: BasketballGame[]; months: BasketballScheduleMonth[];
};
export interface UseBasketballTeamGamesResult {
  games: BasketballGame[];
  months: ScheduleMonthOption[];
  selectedMonthKey: ScheduleMonthKey | null;
  selectMonth: (key: ScheduleMonthKey) => void;
  firstSeasonGame: BasketballGame | null;
  showCountdown: boolean;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

function normalize(response: BasketballTeamScheduleResponse): BasketballTeamScheduleResponse {
  return { league: response.league, team: response.team ?? null,
    season: response.season, games: response.games ?? [], months: response.months ?? [] };
}

function getError(error: unknown): Error {
  const serverError = isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined;
  const message = serverError ?? (error instanceof Error ? error.message : "Failed to fetch basketball team schedule");
  console.error("BASKETBALL TEAM SCHEDULE ERROR:", error);
  return new Error(message);
}

export function useBasketballTeamGames(
  league: BasketballTeamScheduleLeague,
  teamId: string | number | null,
  season: string | number | null,
): UseBasketballTeamGamesResult {
  return useMonthlyTeamSchedule({
    sport: "basketball", league, teamId, season, requireSeason: true,
    endpoint: `api/games/basketball/team/${league}/${teamId}/${season}`,
    normalize, errorFrom: getError,
  });
}
