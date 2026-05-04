import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useCallback, useMemo } from "react";
import { BasketballGame } from "types/basketball";
import { MLBGame } from "types/baseball";
import { FootballGame } from "types/football";
import { NHLGame } from "types/hockey";
import { Game } from "types/nba";
import type { LeagueType } from "types/types";
import {
  getCBBSeason,
  getFootballSeason,
  getMLBSeason,
  getNBASeason,
  getNHLSeason,
} from "utils/dateUtils";
import { useMultipleCBBTeamGames } from "./useMultipleCBBTeamGames";
import { useMultipleFootballTeamGames } from "./useMultipleFootballTeamGames";
import { useMultipleMLBTeamGames } from "./useMultipleMLBTeamGames";
import { useMultipleNHLTeamGames } from "./useMultipleNHLTeamGames";
import { useMultipleTeamGames } from "./useMultipleTeamGames";
import { useMultipleWNBATeamGames } from "./useMultipleWNBATeamGames";

type SupportedGameLeague =
  | "NBA"
  | "NFL"
  | "MLB"
  | "NHL"
  | "WNBA"
  | "CBB"
  | "WCBB"
  | "CFB";

export type ExploreFavoriteTeam = {
  key: string;
  league: SupportedGameLeague;
  id: string;
  raw: unknown;
};

const SUPPORTED_LEAGUES = new Set<SupportedGameLeague>([
  "NBA",
  "NFL",
  "MLB",
  "NHL",
  "WNBA",
  "CBB",
  "WCBB",
  "CFB",
]);

const normalizeLeague = (league: unknown): SupportedGameLeague | null => {
  const normalized = String(league ?? "").trim().toUpperCase();
  return SUPPORTED_LEAGUES.has(normalized as SupportedGameLeague)
    ? (normalized as SupportedGameLeague)
    : null;
};

const getObjectFavoriteId = (
  favorite: Record<string, unknown>,
  league: SupportedGameLeague | null,
) => {
  if (league === "WCBB" && favorite.wid != null) return favorite.wid;

  return (
    favorite.id ??
    favorite.team_id ??
    favorite.teamId ??
    favorite.espnID ??
    favorite.espn_id ??
    favorite.wid
  );
};

export const normalizeExploreFavoriteTeam = (
  favorite: unknown,
): ExploreFavoriteTeam | null => {
  if (typeof favorite === "string") {
    const [leagueValue, idValue] = favorite.split(":");
    const league = normalizeLeague(leagueValue);
    const id = String(idValue ?? "").trim();

    if (!league || !id) return null;

    return {
      key: `${league}:${id}`,
      league,
      id,
      raw: favorite,
    };
  }

  if (!favorite || typeof favorite !== "object") return null;

  const favoriteObject = favorite as Record<string, unknown>;
  const league = normalizeLeague(
    favoriteObject.league ?? favoriteObject.type ?? favoriteObject.sport,
  );
  const idValue = getObjectFavoriteId(favoriteObject, league);
  const id = String(idValue ?? "").trim();

  if (!league || !id) return null;

  return {
    key: `${league}:${id}`,
    league,
    id,
    raw: favorite,
  };
};

const mapToArray = <T,>(
  games: Record<string, T | null>,
  allowedTeamIds: (string | number)[],
) => {
  const seen = new Set<string>();
  const allowedIds = new Set(allowedTeamIds.map(String));

  return Object.entries(games).filter((entry): entry is [string, T] => {
    const [teamId, game] = entry;
    if (!allowedIds.has(String(teamId))) return false;
    if (!game) return false;

    const id = String((game as { id?: string | number }).id ?? "");
    if (!id) return true;
    if (seen.has(id)) return false;

    seen.add(id);
    return true;
  }).map(([, game]) => game);
};

const getIdsByLeague = (
  favoriteTeams: ExploreFavoriteTeam[],
  league: SupportedGameLeague,
) => favoriteTeams.filter((team) => team.league === league).map((team) => team.id);

export function useExploreWidgetGames() {
  const { favorites, isLoading, ready } = useFavoriteTeamsContext();

  const favoriteTeams = useMemo(
    () =>
      favorites
        .map((favorite) => normalizeExploreFavoriteTeam(favorite))
        .filter((favorite): favorite is ExploreFavoriteTeam =>
          Boolean(favorite),
        ),
    [favorites],
  );

  const nbaTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "NBA"),
    [favoriteTeams],
  );
  const nflTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "NFL"),
    [favoriteTeams],
  );
  const mlbTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "MLB"),
    [favoriteTeams],
  );
  const nhlTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "NHL"),
    [favoriteTeams],
  );
  const wnbaTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "WNBA"),
    [favoriteTeams],
  );
  const cbbTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "CBB"),
    [favoriteTeams],
  );
  const wcbbTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "WCBB"),
    [favoriteTeams],
  );
  const cfbTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "CFB"),
    [favoriteTeams],
  );

  const {
    lastGames: nbaGamesMap,
    loading: nbaLoading,
    error: nbaError,
    refresh: refreshNBA,
  } = useMultipleTeamGames(nbaTeamIds, getNBASeason());
  const {
    lastGames: nflGamesMap,
    loading: nflLoading,
    error: nflError,
    refresh: refreshNFL,
  } = useMultipleFootballTeamGames(nflTeamIds, getFootballSeason());
  const {
    lastGames: cfbGamesMap,
    loading: cfbLoading,
    error: cfbError,
    refresh: refreshCFB,
  } = useMultipleFootballTeamGames(cfbTeamIds, getFootballSeason());
  const {
    lastGames: mlbGamesMap,
    loading: mlbLoading,
    error: mlbError,
    refresh: refreshMLB,
  } = useMultipleMLBTeamGames({ teamIds: mlbTeamIds, season: getMLBSeason() });
  const {
    lastGames: nhlGamesMap,
    loading: nhlLoading,
    error: nhlError,
    refresh: refreshNHL,
  } = useMultipleNHLTeamGames({ teamIds: nhlTeamIds, season: getNHLSeason() });
  const {
    lastGames: wnbaGamesMap,
    loading: wnbaLoading,
    error: wnbaError,
    refresh: refreshWNBA,
  } = useMultipleWNBATeamGames({ teamIds: wnbaTeamIds });
  const {
    lastGames: cbbGamesMap,
    loading: cbbLoading,
    error: cbbError,
    refresh: refreshCBB,
  } = useMultipleCBBTeamGames({
    teamIds: cbbTeamIds,
    season: getCBBSeason(),
  });
  const {
    lastGames: wcbbGamesMap,
    loading: wcbbLoading,
    error: wcbbError,
    refresh: refreshWCBB,
  } = useMultipleCBBTeamGames({
    teamIds: wcbbTeamIds,
    season: getCBBSeason(),
    isWomen: true,
  });

  const refresh = useCallback(() => {
    refreshNBA();
    refreshNFL();
    refreshMLB();
    refreshNHL();
    refreshWNBA();
    refreshCBB();
    refreshWCBB();
    refreshCFB();
  }, [
    refreshCBB,
    refreshCFB,
    refreshMLB,
    refreshNBA,
    refreshNFL,
    refreshNHL,
    refreshWCBB,
    refreshWNBA,
  ]);

  return {
    nbaGames: mapToArray<Game>(nbaGamesMap, nbaTeamIds),
    nflGames: mapToArray<FootballGame>(nflGamesMap, nflTeamIds),
    mlbGames: mapToArray<MLBGame>(mlbGamesMap, mlbTeamIds),
    nhlGames: mapToArray<NHLGame>(nhlGamesMap, nhlTeamIds),
    wnbaGames: mapToArray<BasketballGame>(wnbaGamesMap, wnbaTeamIds),
    cbbGames: mapToArray<BasketballGame>(cbbGamesMap, cbbTeamIds),
    wcbbGames: mapToArray<BasketballGame>(wcbbGamesMap, wcbbTeamIds),
    cfbGames: mapToArray<FootballGame>(cfbGamesMap, cfbTeamIds),
    favoriteTeams,
    loading:
      isLoading ||
      !ready ||
      (nbaTeamIds.length > 0 && nbaLoading) ||
      (nflTeamIds.length > 0 && nflLoading) ||
      (mlbTeamIds.length > 0 && mlbLoading) ||
      (nhlTeamIds.length > 0 && nhlLoading) ||
      (wnbaTeamIds.length > 0 && wnbaLoading) ||
      (cbbTeamIds.length > 0 && cbbLoading) ||
      (wcbbTeamIds.length > 0 && wcbbLoading) ||
      (cfbTeamIds.length > 0 && cfbLoading),
    error:
      nbaError ??
      nflError ??
      mlbError ??
      nhlError ??
      wnbaError ??
      cbbError ??
      wcbbError ??
      cfbError,
    refresh,
  };
}

export type ExploreWidgetLeague = SupportedGameLeague | LeagueType;
