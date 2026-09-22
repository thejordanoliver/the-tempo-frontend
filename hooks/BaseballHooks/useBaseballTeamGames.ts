import type { BaseballGame } from "@/types/baseball/baseball";
import { isAxiosError } from "axios";
import { useMonthlyTeamSchedule } from "hooks/Sports/useTeamSchedule";
import type { ScheduleMonthGroup, ScheduleMonthKey, ScheduleMonthOption } from "types/schedule";

export type BaseballTeamScheduleLeague = "mlb" | "cb" | "sb";
export type BaseballScheduleMonth = ScheduleMonthGroup<BaseballGame>;
export type BaseballTeamScheduleTeam = {
  id?: string; code?: string; location?: string; name?: string;
  displayName?: string; logo?: string; recordSummary?: string;
  seasonSummary?: string; standingSummary?: string; groups?: any;
};
type Season = { year: number; type: number; name: string; displayName: string; half: number };
export type BaseballTeamScheduleResponse = {
  league: string; team: BaseballTeamScheduleTeam | null; season: Season;
  games: BaseballGame[]; months: BaseballScheduleMonth[];
};
export interface UseBaseballTeamGamesResult {
  games: BaseballGame[];
  months: ScheduleMonthOption[];
  selectedMonthKey: ScheduleMonthKey | null;
  selectMonth: (key: ScheduleMonthKey) => void;
  firstSeasonGame: BaseballGame | null;
  showCountdown: boolean;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

function normalize(response: BaseballTeamScheduleResponse): BaseballTeamScheduleResponse {
  return { league: response.league, team: response.team ?? null,
    season: response.season, games: response.games ?? [], months: response.months ?? [] };
}

function getError(error: unknown): Error {
  const serverError = isAxiosError<{ error?: string }>(error) ? error.response?.data?.error : undefined;
  const message = serverError ?? (error instanceof Error ? error.message : "Failed to fetch baseball team schedule");
  console.error("BASEBALL TEAM SCHEDULE ERROR:", error);
  return new Error(message);
}

export function useBaseballTeamGames(
  league: BaseballTeamScheduleLeague,
  teamId: string | number | null,
  season: string | number | null,
): UseBaseballTeamGamesResult {
  return useMonthlyTeamSchedule({
    sport: "baseball", league, teamId, season, requireSeason: true,
    endpoint: `api/games/baseball/team/${league}/${teamId}/${season}`,
    normalize, errorFrom: getError,
  });
}
