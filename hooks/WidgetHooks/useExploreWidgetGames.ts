import { FootballGame } from "@/types/football";
import { HockeyGame } from "@/types/hockey";
import type { ExploreGameWidgetType } from "constants/exploreWidgets";
import { useFavoriteTeamsContext } from "contexts/FavoriteTeamsContext";
import { useCallback, useMemo } from "react";
import { BaseballGame } from "types/baseball";
import { BasketballGame } from "types/basketball";
import type { LeagueType } from "types/types";
import { useMultipleBaseballTeamGames } from "./useMultipleBaseballTeamGames";
import { useMultipleBasketballTeamGames } from "./useMultipleBasketballTeamGames";
import { useMultipleFootballTeamGames } from "./useMultipleFootballTeamGames";
import { useMultipleHockeyTeamGames } from "./useMultipleHockeyTeamGames";

type SupportedGameLeague =
  | "NBA"
  | "MLB"
  | "WNBA"
  | "CBB"
  | "WCBB"
  | "NFL"
  | "CFB"
  | "UFL"
  | "NHL";

type UseExploreWidgetGamesOptions = {
  enabledWidgetTypes?: ExploreGameWidgetType[];
};

export type ExploreFavoriteTeam = {
  key: string;
  league: SupportedGameLeague;
  id: string;
  raw: unknown;
};

const SUPPORTED_LEAGUES = new Set<SupportedGameLeague>([
  "NBA",
  "MLB",
  "WNBA",
  "CBB",
  "WCBB",
  "NFL",
  "CFB",
  "UFL",
  "NHL",
]);

const normalizeLeague = (league: unknown): SupportedGameLeague | null => {
  const normalized = String(league ?? "")
    .trim()
    .toUpperCase();

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
    favorite.espnId ??
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

const mapToArray = <T>(
  games: Record<string, T | null>,
  allowedTeamIds: (string | number)[],
) => {
  const seen = new Set<string>();
  const allowedIds = new Set(allowedTeamIds.map(String));

  return Object.entries(games)
    .filter((entry): entry is [string, T] => {
      const [teamId, game] = entry;

      if (!allowedIds.has(String(teamId))) return false;
      if (!game) return false;

      const id = String((game as { id?: string | number }).id ?? "");

      if (!id) return true;
      if (seen.has(id)) return false;

      seen.add(id);
      return true;
    })
    .map(([, game]) => game);
};

const getIdsByLeague = (
  favoriteTeams: ExploreFavoriteTeam[],
  league: SupportedGameLeague,
) => {
  return favoriteTeams
    .filter((team) => team.league === league)
    .map((team) => team.id);
};

export function useExploreWidgetGames({
  enabledWidgetTypes = [],
}: UseExploreWidgetGamesOptions = {}) {
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
  const mlbTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "MLB"),
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
  const nflTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "NFL"),
    [favoriteTeams],
  );
  const cfbTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "CFB"),
    [favoriteTeams],
  );
  const nhlTeamIds = useMemo(
    () => getIdsByLeague(favoriteTeams, "NHL"),
    [favoriteTeams],
  );

  const enabledWidgetTypeSet = useMemo(
    () => new Set<ExploreGameWidgetType>(enabledWidgetTypes),
    [enabledWidgetTypes],
  );
  const needsAllGameLeagues = enabledWidgetTypeSet.has("favorite_games");
  const shouldFetchNBA =
    needsAllGameLeagues || enabledWidgetTypeSet.has("nba_games");
  const shouldFetchMLB =
    needsAllGameLeagues || enabledWidgetTypeSet.has("mlb_games");
  const shouldFetchWNBA =
    needsAllGameLeagues || enabledWidgetTypeSet.has("wnba_games");
  const shouldFetchCBB =
    needsAllGameLeagues || enabledWidgetTypeSet.has("cbb_games");
  const shouldFetchWCBB =
    needsAllGameLeagues || enabledWidgetTypeSet.has("wcbb_games");
  const shouldFetchNFL =
    needsAllGameLeagues || enabledWidgetTypeSet.has("nfl_games");
  const shouldFetchCFB =
    needsAllGameLeagues || enabledWidgetTypeSet.has("cfb_games");
  const shouldFetchNHL =
    needsAllGameLeagues || enabledWidgetTypeSet.has("nhl_games");

  const enabledNbaTeamIds = shouldFetchNBA ? nbaTeamIds : [];
  const enabledMlbTeamIds = shouldFetchMLB ? mlbTeamIds : [];
  const enabledWnbaTeamIds = shouldFetchWNBA ? wnbaTeamIds : [];
  const enabledCbbTeamIds = shouldFetchCBB ? cbbTeamIds : [];
  const enabledWcbbTeamIds = shouldFetchWCBB ? wcbbTeamIds : [];
  const enabledNflTeamIds = shouldFetchNFL ? nflTeamIds : [];
  const enabledCfbTeamIds = shouldFetchCFB ? cfbTeamIds : [];
  const enabledNhlTeamIds = shouldFetchNHL ? nhlTeamIds : [];

  const {
    lastGames: nbaGamesMap,
    loading: nbaLoading,
    error: nbaError,
    refresh: refreshNBA,
  } = useMultipleBasketballTeamGames({
    league: "nba",
    teamIds: enabledNbaTeamIds,
  });

  const {
    lastGames: mlbGamesMap,
    loading: mlbLoading,
    error: mlbError,
    refresh: refreshMLB,
  } = useMultipleBaseballTeamGames({
    league: "mlb",
    teamIds: enabledMlbTeamIds,
  });

  const {
    lastGames: wnbaGamesMap,
    loading: wnbaLoading,
    error: wnbaError,
    refresh: refreshWNBA,
  } = useMultipleBasketballTeamGames({
    league: "wnba",
    teamIds: enabledWnbaTeamIds,
  });

  const {
    lastGames: cbbGamesMap,
    loading: cbbLoading,
    error: cbbError,
    refresh: refreshCBB,
  } = useMultipleBasketballTeamGames({
    league: "cbb",
    teamIds: enabledCbbTeamIds,
  });

  const {
    lastGames: wcbbGamesMap,
    loading: wcbbLoading,
    error: wcbbError,
    refresh: refreshWCBB,
  } = useMultipleBasketballTeamGames({
    league: "wcbb",
    teamIds: enabledWcbbTeamIds,
  });

  const {
    lastGames: nflGamesMap,
    loading: nflLoading,
    error: nflError,
    refresh: refreshNFL,
  } = useMultipleFootballTeamGames({
    league: "nfl",
    teamIds: enabledNflTeamIds,
  });

  const {
    lastGames: cfbGamesMap,
    loading: cfbLoading,
    error: cfbError,
    refresh: refreshCFB,
  } = useMultipleFootballTeamGames({
    league: "cfb",
    teamIds: enabledCfbTeamIds,
  });

  const {
    lastGames: nhlGamesMap,
    loading: nhlLoading,
    error: nhlError,
    refresh: refreshNHL,
  } = useMultipleHockeyTeamGames({
    league: "nhl",
    teamIds: enabledNhlTeamIds,
  });

  const refresh = useCallback(() => {
    refreshNBA();
    refreshMLB();
    refreshWNBA();
    refreshCBB();
    refreshWCBB();
    refreshNFL();
    refreshCFB();
    refreshNHL();
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
    nbaGames: mapToArray<BasketballGame>(nbaGamesMap, enabledNbaTeamIds),
    mlbGames: mapToArray<BaseballGame>(mlbGamesMap, enabledMlbTeamIds),
    wnbaGames: mapToArray<BasketballGame>(wnbaGamesMap, enabledWnbaTeamIds),
    cbbGames: mapToArray<BasketballGame>(cbbGamesMap, enabledCbbTeamIds),
    wcbbGames: mapToArray<BasketballGame>(wcbbGamesMap, enabledWcbbTeamIds),
    nflGames: mapToArray<FootballGame>(nflGamesMap, enabledNflTeamIds),
    cfbGames: mapToArray<FootballGame>(cfbGamesMap, enabledCfbTeamIds),
    nhlGames: mapToArray<HockeyGame>(nhlGamesMap, enabledNhlTeamIds),

    favoriteTeams,

    loading:
      isLoading ||
      !ready ||
      (enabledNbaTeamIds.length > 0 && nbaLoading) ||
      (enabledMlbTeamIds.length > 0 && mlbLoading) ||
      (enabledWnbaTeamIds.length > 0 && wnbaLoading) ||
      (enabledCbbTeamIds.length > 0 && cbbLoading) ||
      (enabledWcbbTeamIds.length > 0 && wcbbLoading) ||
      (enabledNflTeamIds.length > 0 && nflLoading) ||
      (enabledCfbTeamIds.length > 0 && cfbLoading) ||
      (enabledNhlTeamIds.length > 0 && nhlLoading),

    error:
      (enabledNbaTeamIds.length > 0 ? nbaError : null) ??
      (enabledMlbTeamIds.length > 0 ? mlbError : null) ??
      (enabledWnbaTeamIds.length > 0 ? wnbaError : null) ??
      (enabledCbbTeamIds.length > 0 ? cbbError : null) ??
      (enabledWcbbTeamIds.length > 0 ? wcbbError : null) ??
      (enabledNflTeamIds.length > 0 ? nflError : null) ??
      (enabledCfbTeamIds.length > 0 ? cfbError : null) ??
      (enabledNhlTeamIds.length > 0 ? nhlError : null),

    refresh,
  };
}

export type ExploreWidgetLeague = SupportedGameLeague | LeagueType;
