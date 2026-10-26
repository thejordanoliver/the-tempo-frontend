import {
  LEAGUE_CONFIG,
  HOME_SCORE_LEAGUES,
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
import { isGameLive } from "utils/games/games";

type BuildHomeGameSectionsOptions = {
  sources: readonly HomeLeagueSource[];
  favoriteTeams: readonly string[];
  favoriteSports: readonly FavoriteSportId[];
  favoriteSportsReady: boolean;
  maxGamesPerLeague?: number;
};

/** Wait for account preferences before choosing general versus personalized feeds. */
export function getHomeRequestLeagues({
  selectedTab,
  favoriteTeams,
  favoriteSports,
  favoriteTeamsReady,
  favoriteSportsReady,
  favoriteSportsError,
  userId,
}: {
  selectedTab: "scores" | "for you";
  favoriteTeams: readonly string[];
  favoriteSports: readonly FavoriteSportId[];
  favoriteTeamsReady: boolean;
  favoriteSportsReady: boolean;
  favoriteSportsError: unknown;
  userId: number | null;
}): ReadonlySet<HomeLeagueId> {
  if (
    selectedTab !== "scores" ||
    !favoriteTeamsReady ||
    (userId !== null && !favoriteSportsReady && !favoriteSportsError)
  ) {
    return new Set();
  }
  if (!favoriteTeams.length && !favoriteSports.length) {
    return new Set(HOME_SCORE_LEAGUES);
  }
  const needed = new Set<string>(favoriteSports);
  for (const favorite of favoriteTeams) {
    const league = favorite.split(":")[0];
    if (league === "socc") {
      // Soccer team IDs span competitions; keep every existing Home soccer feed.
      for (const id of HOME_SCORE_LEAGUES) {
        if (LEAGUE_CONFIG[id].route === "/league/soccer") needed.add(id);
      }
    } else {
      needed.add(league);
    }
  }
  return new Set(HOME_SCORE_LEAGUES.filter((league) => needed.has(league)));
}

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

  const games = Array.isArray(source.games) ? source.games : [];

  if (__DEV__ && !Array.isArray(source.games)) {
    console.warn(
      `[homeGames] ${source.id} received invalid games value:`,
      source.games,
    );
  }

  games.forEach((game, index) => {
    const key = `${source.id}:${getGameIdentity(game, index)}`;

    if (seen.has(key)) return;

    seen.add(key);

    items.push({
      key,
      league: source.id,
      game,
    });
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

function getGamePriority(item: HomeGameItem): number {
  if (isGameLive(item.game)) return 0;
  return item.game.status?.state === "post" ? 2 : 1;
}

function sortHomeGames(items: readonly HomeGameItem[]): HomeGameItem[] {
  return [...items].sort((a, b) => {
    const statusDifference = getGamePriority(a) - getGamePriority(b);
    if (statusDifference !== 0) return statusDifference;

    // Matchup policy belongs to the backend. Older responses have neutral priority.
    const aPriority = Array.isArray(a.game.matchupPriority)
      ? a.game.matchupPriority
      : [];
    const bPriority = Array.isArray(b.game.matchupPriority)
      ? b.game.matchupPriority
      : [];

    for (
      let index = 0;
      index < Math.max(aPriority.length, bPriority.length);
      index++
    ) {
      const aValue = Number.isFinite(aPriority[index]) ? aPriority[index] : 0;
      const bValue = Number.isFinite(bPriority[index]) ? bPriority[index] : 0;
      const difference = bValue - aValue;
      if (difference !== 0) return difference;
    }
    return 0;
  });
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

  getFavoriteTeamLeagueOrder(favoriteTeams).forEach((league) =>
    ordered.add(league),
  );

  favoriteSports.forEach((league) => ordered.add(league));

  return Array.from(ordered);
}

export function buildHomeGameSections({
  sources,
  favoriteTeams,
  favoriteSports,
  favoriteSportsReady,
  maxGamesPerLeague = 5,
}: BuildHomeGameSectionsOptions): HomeGameSection[] {
  const safeSources = Array.isArray(sources) ? sources : [];

  const favoriteTeamKeys = new Set(favoriteTeams ?? []);
  const nonFavoriteGamesByLeague = new Map<HomeLeagueId, HomeGameItem[]>();
  const favoriteTeamGames: HomeGameItem[] = [];
  const seenFavoriteGames = new Set<string>();

  for (const source of safeSources) {
    if (!source?.id) continue;

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
      sortHomeGames(nonFavoriteItems).slice(0, maxGamesPerLeague),
    );
  }

  const sections: HomeGameSection[] = [];
  if (
    favoriteSportsReady &&
    favoriteTeamKeys.size === 0 &&
    favoriteSports.length === 0
  ) {
    const games = sortHomeGames(
      safeSources.flatMap(
        (source) => nonFavoriteGamesByLeague.get(source.id) ?? [],
      ),
    );
    return [
      { id: "general-live" as const, title: "Live now", priority: 0 },
      { id: "general-upcoming" as const, title: "Upcoming", priority: 1 },
      { id: "general-final" as const, title: "Final", priority: 2 },
    ]
      .map(({ id, title, priority }) => ({
        id,
        title,
        data: games.filter((item) => getGamePriority(item) === priority),
      }))
      .filter((section) => section.data.length > 0);
  }

  const sortedFavoriteTeamGames = sortHomeGames(favoriteTeamGames);

  if (sortedFavoriteTeamGames.length > 0) {
    sections.push({
      id: MY_TEAMS_SECTION_ID,
      title: MY_TEAMS_SECTION_TITLE,
      data: sortedFavoriteTeamGames,
    });
  }

  const orderedLeagueIds: HomeLeagueId[] = [];
  const seenLeagueIds = new Set<HomeLeagueId>();

  const appendFavoriteLeague = (league: FavoriteSportId) => {
    const source = safeSources.find(({ id }) => id === league);

    if (!source || seenLeagueIds.has(source.id)) return;

    seenLeagueIds.add(source.id);
    orderedLeagueIds.push(source.id);
  };

  if (favoriteSportsReady) {
    const favoriteLeagueIds = new Set(favoriteSports);

    getPersonalizedLeagueOrder({
      favoriteTeams,
      favoriteSports,
      favoriteSportsReady,
    })
      .filter((league) => favoriteLeagueIds.has(league))
      .forEach(appendFavoriteLeague);
  }

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
