import { useMonthlyTeamSchedule } from "hooks/Sports/useTeamSchedule";
import type {
  VolleyballGame,
  VolleyballLeagueKey,
  VolleyballSchedule,
} from "types/volleyball/volleyball";
import { getErrorMessage } from "utils/common/getErrorMessage";

const normalize = (response: VolleyballSchedule): VolleyballSchedule => ({
  ...response,
  games: response.games ?? [],
  months: response.months ?? [],
});
const errorFrom = (error: unknown) =>
  new Error(getErrorMessage(error, "Unable to load the team schedule."));

export function useVolleyballTeamGames(
  league: VolleyballLeagueKey,
  teamId: number | null,
) {
  return useMonthlyTeamSchedule<
    VolleyballGame,
    VolleyballSchedule,
    VolleyballSchedule,
    Error
  >({
    sport: "volleyball",
    league,
    teamId,
    endpoint: `/api/games/volleyball/team/${league}/${teamId ?? ""}`,
    normalize,
    errorFrom,
  });
}
