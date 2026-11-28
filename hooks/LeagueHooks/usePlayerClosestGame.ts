import { useTeamSchedule } from "hooks/Sports/useTeamSchedule";
import type { PlayerGameLogSport } from "types/playerGameLog";
import {
  getClosestPlayerGame,
  type PlayerScheduleGame,
} from "utils/players/playerClosestGame";

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
  isActive: boolean,
) {
  const scheduleTeamId = isActive ? (teamId ?? null) : null;
  const schedule = useTeamSchedule<
    Game,
    ScheduleResponse<Game>,
    { games: Game[] },
    string
  >({
    sport,
    league,
    teamId: scheduleTeamId,
    endpoint: `/api/games/${sport}/team/${league}/${scheduleTeamId}`,
    normalize,
    errorFrom,
  });
  return {
    game: isActive ? getClosestPlayerGame(schedule.data?.games ?? []) : null,
    loading: isActive && schedule.loading,
    error: isActive ? schedule.error : null,
  };
}
