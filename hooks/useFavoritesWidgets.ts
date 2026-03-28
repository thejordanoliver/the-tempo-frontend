// hooks/useFavoriteWidgets.ts
import { useCallback, useMemo } from "react";
import { useColorScheme } from "react-native";
import { getNBASeason } from "utils/dateUtils";
import { useMultipleLastTeamGame } from "./NBAHooks/useMultipleLastTeamGame";
import { useFavoriteTeams } from "./UserHooks/useFavoriteTeams";
import { useWidgetGameLeaders } from "./useWidgetGameLeaders";
import { Game } from "types/types";

export function useFavoriteWidgets(topN = 4) {
  const isDark = useColorScheme() === "dark";
  const { favorites } = useFavoriteTeams();

  // -------------------------------
  // Helpers
  // -------------------------------
  const getLeagueIds = useCallback(
    (prefix: string) =>
      favorites
        .filter((f: string) => f.startsWith(prefix))
        .map((f: string) => f.split(":")[1]),
    [favorites],
  );

  // -------------------------------
  // Team IDs
  // -------------------------------
  const nbaTeamIds = useMemo(() => getLeagueIds("NBA:"), [getLeagueIds]);
  const nflTeamIds = useMemo(() => getLeagueIds("NFL:"), [getLeagueIds]);
  const cfbTeamIds = useMemo(() => getLeagueIds("CFB:"), [getLeagueIds]);
  const cbbTeamIds = useMemo(() => getLeagueIds("CBB:"), [getLeagueIds]);
  const wcbbTeamIds = useMemo(() => getLeagueIds("WCBB:"), [getLeagueIds]);

  // -------------------------------
  // Fetch Games
  // -------------------------------
  const { lastGames: nbaGames, loading: nbaLoading } = useMultipleLastTeamGame(
    nbaTeamIds,
    getNBASeason(),
  );

  // -------------------------------
  // Widgets (Raw Response)
  // -------------------------------
const nbaWidgets: Record<string, any[]> = useMemo(() => {
  return Object.fromEntries(
    Object.entries(nbaGames).map(([teamId, game]) => [teamId, game ? [game] : []])
  );
}, [nbaGames]);
const leadersMap = useWidgetGameLeaders(
  Object.values(nbaGames)
    .filter((game): game is Game => !!game && game.status.long !== "Scheduled") // only started games
    .flat(),
  topN,
  isDark,
);

  return {
    nbaWidgets,
    leadersMap,
    nbaLoading,
  };
}
