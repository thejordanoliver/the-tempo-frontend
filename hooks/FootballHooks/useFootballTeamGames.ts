import type { FootballGame } from "@/types/football/football";
import { useTeamSchedule } from "hooks/Sports/useTeamSchedule";

type FootballTeamGamesResponse = { games?: FootballGame[] };
interface UseTeamGamesReturn {
  games: FootballGame[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refreshGames: () => Promise<void>;
}

function normalize(response: FootballTeamGamesResponse): { games: FootballGame[] } {
  return { games: Array.isArray(response?.games) ? response.games : [] };
}

function getError(error: unknown): string {
  console.error("Error fetching football team games:", error instanceof Error ? error.message : error);
  return "Failed to load team games";
}

export function useFootballTeamGames(
  teamId: string | number | null,
  league: string = "nfl",
  season?: number | string,
): UseTeamGamesReturn {
  const hasSeason = season !== undefined && season !== "";
  const endpoint = hasSeason
    ? `/api/games/football/team/${league}/${teamId}/${season}`
    : `/api/games/football/team/${league}/${teamId}`;
  const schedule = useTeamSchedule({
    sport: "football", league, teamId, season, endpoint, normalize,
    errorFrom: getError, clearOnRefreshError: true,
  });
  return { games: schedule.data?.games ?? [], loading: schedule.loading,
    refreshing: schedule.refreshing, error: schedule.error, refreshGames: schedule.refresh };
}
