import { usePaginatedNews } from "./usePaginatedNews";

type UseTeamNewsOptions = {
  enabled?: boolean;
};

export function useTeamNews(
  league: string,
  teamId: number,
  limit: number = 10,
  { enabled = true }: UseTeamNewsOptions = {},
) {
  const validTeam = league && Number.isInteger(teamId) && teamId > 0;

  return usePaginatedNews({
    url: validTeam
      ? `/api/news/team/${String(league).toLowerCase()}/${teamId}`
      : null,
    limit,
    enabled,
    invalidMessage: "A valid team is required.",
  });
}
