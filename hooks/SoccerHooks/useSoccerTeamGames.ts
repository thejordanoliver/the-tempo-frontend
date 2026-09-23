import type { SoccerGame } from "@/types/soccer/soccer";
import { isAxiosError } from "axios";
import { useMonthlyTeamSchedule } from "hooks/Sports/useTeamSchedule";
import type {
  ScheduleMonthGroup,
  ScheduleMonthKey,
  ScheduleMonthOption,
} from "types/schedule";

export type SoccerScheduleMonth = ScheduleMonthGroup<SoccerGame>;

type SoccerTeamScheduleResponse = {
  league: string;
  team: unknown;
  season: unknown;
  games: SoccerGame[];
  months: SoccerScheduleMonth[];
};

interface UseSoccerTeamGamesResult {
  games: SoccerGame[];
  months: ScheduleMonthOption[];
  selectedMonthKey: ScheduleMonthKey | null;
  selectMonth: (key: ScheduleMonthKey) => void;
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

function normalize(
  response: SoccerTeamScheduleResponse,
): SoccerTeamScheduleResponse {
  return {
    ...response,
    games: response.games ?? [],
    months: response.months ?? [],
  };
}

function getError(error: unknown): Error {
  const serverError = isAxiosError<{ error?: string }>(error)
    ? error.response?.data?.error
    : undefined;
  const message =
    serverError ??
    (error instanceof Error
      ? error.message
      : "Failed to fetch soccer team schedule");

  console.error("SOCCER TEAM SCHEDULE ERROR:", error);
  return new Error(message);
}

export function useSoccerTeamGames(
  teamId: string | number | null,
  league: string,
  season?: number | string,
): UseSoccerTeamGamesResult {
  return useMonthlyTeamSchedule({
    sport: "soccer",
    league,
    teamId,
    season,
    requireSeason: true,
    endpoint: `api/games/soccer/team/${league}/${teamId}/${season}`,
    normalize,
    errorFrom: getError,
  });
}
