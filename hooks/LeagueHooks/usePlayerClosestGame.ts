import { useTeamSchedule } from "hooks/Sports/useTeamSchedule";
import type { PlayerGameLogSport } from "types/playerGameLog";
import { getClosestPlayerGame, type PlayerScheduleGame } from "utils/players/playerClosestGame";

type ScheduleResponse<Game> = { games?: Game[] };
function normalize<Game>(response: ScheduleResponse<Game>): { games: Game[] } {
  return { games: response.games ?? [] };
}
function errorFrom(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to load player game";
}

export function usePlayerClosestGame<Game extends PlayerScheduleGame>(
  sport: PlayerGameLogSport,
  league: string,
  teamId: string | number | null | undefined,
) {
  const schedule = useTeamSchedule<Game, ScheduleResponse<Game>, { games: Game[] }, string>({
    sport, league, teamId: teamId ?? null,
    endpoint: `/api/games/${sport}/team/${league}/${teamId}`,
    normalize, errorFrom,
  });
  return {
    game: getClosestPlayerGame(schedule.data?.games ?? []),
    loading: schedule.loading,
    error: schedule.error,
  };
}
