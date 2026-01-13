import { useHighlights } from "./useHighlights";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

/**
 * Main hook for fetching highlights by league and team
 * @param league "nba" | "nfl" | "cfb" | "cbb" | "all"
 * @param teamName optional team name for filtering highlights
 * @param maxResults max number of results (default 30)
 */
export function useTeamHighlights(
  league: "nba" | "nfl" | "cfb" | "cbb" | "wcbb" | "mlb" |  "all" = "nba",
  teamName?: string,
  maxResults = 30
) {
  const normalizedLeague = league.toLowerCase();

  // ✅ Use only the dynamic route (works for both league-only and team routes)
  const endpoint = teamName
    ? `${BASE_URL}/highlights/${normalizedLeague}/${encodeURIComponent(teamName)}`
    : `${BASE_URL}/highlights/${normalizedLeague}`;

  // ✅ Construct YouTube search query
  const query = teamName
    ? `${teamName} ${league.toUpperCase()} highlights`
    : `${league.toUpperCase()} highlights`;

  return useHighlights(query, endpoint, maxResults);
}
