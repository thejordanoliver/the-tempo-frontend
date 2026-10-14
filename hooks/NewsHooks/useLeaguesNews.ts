import { usePaginatedNews } from "./usePaginatedNews";

export type { NewsArticle, NewsResponse } from "./usePaginatedNews";

type UseLeaguesNewsOptions = {
  enabled?: boolean;
};

export function useLeaguesNews(
  league: string,
  limit: number = 10,
  { enabled = true }: UseLeaguesNewsOptions = {},
) {
  return usePaginatedNews({
    url: league ? `/api/news/league/${String(league).toLowerCase()}` : null,
    limit,
    enabled,
    invalidMessage: "League is required.",
  });
}
