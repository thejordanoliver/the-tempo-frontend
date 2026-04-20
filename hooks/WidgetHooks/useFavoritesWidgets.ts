// hooks/useFavoriteWidgets.ts
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useCallback, useMemo } from "react";
import {
  getCBBSeason,
  getFootballSeason,
  getNBASeason,
  getNHLSeason,
} from "utils/dateUtils";
import { useMultipleCBBTeamGames } from "./useMultipleCBBTeamGames";
import { useMultipleTeamGames } from "./useMultipleTeamGames";
import { useMultipleFootballTeamGames } from "./useMultipleFootballTeamGames";
import { useMultipleNHLTeamGames } from "./useMultipleNHLTeamGames";
import { useMultipleWNBATeamGames } from "./useMultipleWNBATeamGames";

export function useFavoriteWidgets(topN = 4) {
  const { favorites } = useFavoriteTeamsContext();

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
  const wnbaTeamIds = useMemo(() => getLeagueIds("WNBA:"), [getLeagueIds]);
  const nhlTeamIds = useMemo(() => getLeagueIds("NHL:"), [getLeagueIds]);

  // -------------------------------
  // Fetch Games
  // -------------------------------
  const { lastGames: nbaGames, loading: nbaLoading } = useMultipleTeamGames(
    nbaTeamIds,
    getNBASeason(),
  );

  const { lastGames: nflGames, loading: nflLoading } =
    useMultipleFootballTeamGames(nflTeamIds, getFootballSeason());

  const { lastGames: cfbGames, loading: cfbLoading } =
    useMultipleFootballTeamGames(cfbTeamIds, getFootballSeason());

  const { lastGames: cbbGames, loading: cbbLoading } = useMultipleCBBTeamGames({
    teamIds: cbbTeamIds,
    season: getCBBSeason(),
  });

  const { lastGames: wcbbGames, loading: wcbbLoading } =
    useMultipleCBBTeamGames({
      teamIds: wcbbTeamIds,
      season: getCBBSeason(),
      isWomen: true,
    });

  const { lastGames: wnbaGames, loading: wnbaLoading } =
    useMultipleWNBATeamGames({
      teamIds: wnbaTeamIds,
    });
  const { lastGames: nhlGames, loading: nhlLoadig } = useMultipleNHLTeamGames({
    teamIds: nhlTeamIds,
    season: getNHLSeason(),
  });

  // -------------------------------
  // Widgets (Raw Response)
  // -------------------------------
  const nbaWidgets: Record<string, any[]> = useMemo(() => {
    return Object.fromEntries(
      Object.entries(nbaGames).map(([teamId, game]) => [
        teamId,
        game ? [game] : [],
      ]),
    );
  }, [nbaGames]);

  const nflWidgets: Record<string, any[]> = useMemo(() => {
    return Object.fromEntries(
      Object.entries(nflGames).map(([teamId, game]) => [
        teamId,
        game ? [game] : [],
      ]),
    );
  }, [nflGames]);

  const cfbWidgets: Record<string, any[]> = useMemo(() => {
    return Object.fromEntries(
      Object.entries(cfbGames).map(([teamId, game]) => [
        teamId,
        game ? [game] : [],
      ]),
    );
  }, [cfbGames]);

  const cbbWidgets: Record<string, any[]> = useMemo(() => {
    return Object.fromEntries(
      Object.entries(cbbGames).map(([teamId, game]) => [
        teamId,
        game ? [game] : [],
      ]),
    );
  }, [cbbGames]);

  const wcbbWidgets: Record<string, any[]> = useMemo(() => {
    return Object.fromEntries(
      Object.entries(wcbbGames).map(([teamId, game]) => [
        teamId,
        game ? [game] : [],
      ]),
    );
  }, [wcbbGames]);

  const wnbaWidgets: Record<string, any[]> = useMemo(() => {
    return Object.fromEntries(
      Object.entries(wnbaGames).map(([teamId, game]) => [
        teamId,
        game ? [game] : [],
      ]),
    );
  }, [wnbaGames]);

  const nhlWidgets: Record<string, any[]> = useMemo(() => {
    return Object.fromEntries(
      Object.entries(nhlGames).map(([teamId, game]) => [
        teamId,
        game ? [game] : [],
      ]),
    );
  }, [nhlGames]);

  return {
    nbaWidgets,
    nflWidgets,
    cfbWidgets,
    cbbWidgets,
    wcbbWidgets,
    wnbaWidgets,
    nhlWidgets,
    nbaLoading,
    nflLoading,
    cfbLoading,
    cbbLoading,
    wcbbLoading,
    wnbaLoading,
    nhlLoadig,
  };
}
