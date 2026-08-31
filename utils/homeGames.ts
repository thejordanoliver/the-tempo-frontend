import {
  LEAGUE_CONFIG,
  MY_TEAMS_SECTION_ID,
  MY_TEAMS_SECTION_TITLE,
  isFavoriteSportId,
  type FavoriteSportId,
  type HomeLeagueId,
} from "constants/leagues";
import type {
  HomeGameItem,
  HomeGameSection,
  HomeLeagueSource,
  LeagueGame,
} from "types/leagues";
import { isGameLive } from "utils/games";

type BuildHomeGameSectionsOptions = {
  sources: readonly HomeLeagueSource[];
  favoriteTeams: readonly string[];
  favoriteSports: readonly FavoriteSportId[];
  favoriteSportsReady: boolean;
  maxGamesPerLeague?: number;
};

function getTeamId(team: unknown): string | null {
  if (!team || typeof team !== "object" || !("id" in team)) return null;

  const id = team.id;

  return typeof id === "string" || typeof id === "number" ? String(id) : null;
}

function getGameIdentity(game: LeagueGame, fallbackIndex: number): string {
  const id = game.id ?? game.uid;

  if (typeof id === "string" || typeof id === "number") {
    return String(id);
  }

  return `index-${fallbackIndex}`;
}

function createLeagueGameItems(source: HomeLeagueSource): HomeGameItem[] {
  const seen = new Set<string>();
  const items: HomeGameItem[] = [];

  source.games.forEach((game, index) => {
    const key = `${source.id}:${getGameIdentity(game, index)}`;

    if (seen.has(key)) return;

    seen.add(key);
    items.push({ key, league: source.id, game });
  });

  return items;
}

function isFavoriteTeamGame(
  item: HomeGameItem,
  favoriteTeamKeys: ReadonlySet<string>,
): boolean {
  const game = item.game;
  const homeId = "home" in game ? getTeamId(game.home) : null;
  const awayId = "away" in game ? getTeamId(game.away) : null;

  return (
    (homeId !== null && favoriteTeamKeys.has(`${item.league}:${homeId}`)) ||
    (awayId !== null && favoriteTeamKeys.has(`${item.league}:${awayId}`))
  );
}

function sortLiveFirst(items: readonly HomeGameItem[]): HomeGameItem[] {
  return [...items].sort(
    (a, b) => Number(isGameLive(b.game)) - Number(isGameLive(a.game)),
  );
}

export function getFavoriteTeamLeagueOrder(
  favoriteTeams: readonly string[],
): FavoriteSportId[] {
  const seen = new Set<FavoriteSportId>();

  for (const favorite of favoriteTeams) {
    const separatorIndex = favorite.indexOf(":");

    if (separatorIndex <= 0) continue;

    const league = favorite.slice(0, separatorIndex);

    if (isFavoriteSportId(league)) {
      seen.add(league);
    }
  }

  return Array.from(seen);
}

export function getPersonalizedLeagueOrder({
  favoriteTeams,
  favoriteSports,
  favoriteSportsReady,
}: Pick<
  BuildHomeGameSectionsOptions,
  "favoriteTeams" | "favoriteSports" | "favoriteSportsReady"
>): FavoriteSportId[] {
  if (!favoriteSportsReady) return [];

  const ordered = new Set<FavoriteSportId>();

  favoriteSports.forEach((league) => ordered.add(league));
  getFavoriteTeamLeagueOrder(favoriteTeams).forEach((league) =>
    ordered.add(league),
  );

  return Array.from(ordered);
}

export function buildHomeGameSections({
  sources,
  favoriteTeams,
  favoriteSports,
  favoriteSportsReady,
  maxGamesPerLeague = 5,
}: BuildHomeGameSectionsOptions): HomeGameSection[] {
  const favoriteTeamKeys = new Set(favoriteTeams);
  const sourceById = new Map<FavoriteSportId, HomeLeagueSource>();
  const nonFavoriteGamesByLeague = new Map<HomeLeagueId, HomeGameItem[]>();
  const favoriteTeamGames: HomeGameItem[] = [];
  const seenFavoriteGames = new Set<string>();

  for (const source of sources) {
    sourceById.set(source.id, source);

    const items = createLeagueGameItems(source);
    const nonFavoriteItems: HomeGameItem[] = [];

    for (const item of items) {
      if (isFavoriteTeamGame(item, favoriteTeamKeys)) {
        if (!seenFavoriteGames.has(item.key)) {
          seenFavoriteGames.add(item.key);
          favoriteTeamGames.push(item);
        }
      } else {
        nonFavoriteItems.push(item);
      }
    }

    nonFavoriteGamesByLeague.set(
      source.id,
      sortLiveFirst(nonFavoriteItems).slice(0, maxGamesPerLeague),
    );
  }

  const sections: HomeGameSection[] = [];
  const sortedFavoriteTeamGames = sortLiveFirst(favoriteTeamGames);

  if (sortedFavoriteTeamGames.length > 0) {
    sections.push({
      id: MY_TEAMS_SECTION_ID,
      title: MY_TEAMS_SECTION_TITLE,
      data: sortedFavoriteTeamGames,
    });
  }

  const orderedLeagueIds: HomeLeagueId[] = [];
  const seenLeagueIds = new Set<HomeLeagueId>();

  const appendSupportedLeague = (league: FavoriteSportId) => {
    const source = sourceById.get(league);

    if (!source || seenLeagueIds.has(source.id)) return;

    seenLeagueIds.add(source.id);
    orderedLeagueIds.push(source.id);
  };

  getPersonalizedLeagueOrder({
    favoriteTeams,
    favoriteSports,
    favoriteSportsReady,
  }).forEach(appendSupportedLeague);

  sources.forEach((source) => appendSupportedLeague(source.id));

  for (const league of orderedLeagueIds) {
    const data = nonFavoriteGamesByLeague.get(league) ?? [];

    if (data.length === 0) continue;

    sections.push({
      id: league,
      title: LEAGUE_CONFIG[league].label,
      data,
    });
  }

  return sections;
}
