import type { FavoriteSportId } from "constants/leagues";
import type { ImageSourcePropType } from "react-native";

export const FAVORITE_LEAGUES = [
  "nba",
  "wnba",
  "nfl",
  "cfb",
  "cbb",
  "wcbb",
  "mlb",
  "cb",
  "sb",
  "nhl",
] as const;

export type FavoriteLeague = (typeof FAVORITE_LEAGUES)[number];
export type FavoriteTeamKey = `${FavoriteLeague}:${number}`;

type FavoriteItemBase = {
  name: string;
  color?: string;
  key: string;
  isDark: boolean;
};

export type FavoriteTeamItem = FavoriteItemBase & {
  kind: "team";
  id: string;
  code: string;
  logo?: ImageSourcePropType | null;
  league: FavoriteLeague;
};

export type FavoriteLeagueItem = FavoriteItemBase & {
  kind: "league";
  id: FavoriteSportId;
  league: FavoriteSportId;
  logo: ImageSourcePropType;
};

export type FavoriteItem = FavoriteTeamItem | FavoriteLeagueItem;

export type FavoriteRailOrder = {
  favoriteTeamIds: FavoriteTeamKey[];
  favoriteSports: FavoriteSportId[];
};

export function isFavoriteLeague(value: string): value is FavoriteLeague {
  return (FAVORITE_LEAGUES as readonly string[]).includes(value);
}

export function normalizeFavoriteTeamKey(
  value: unknown,
): FavoriteTeamKey | null {
  if (typeof value !== "string") return null;

  const match = value.trim().match(/^([A-Za-z0-9_-]+):([0-9]+)$/);
  if (!match) return null;

  const league = match[1].toLowerCase();
  const teamId = Number(match[2]);

  if (!isFavoriteLeague(league)) return null;
  if (!Number.isSafeInteger(teamId) || teamId <= 0) return null;

  return `${league}:${teamId}`;
}

export function normalizeFavoriteTeamKeys(
  value: unknown,
): FavoriteTeamKey[] {
  if (!Array.isArray(value)) return [];

  const favorites: FavoriteTeamKey[] = [];
  const seen = new Set<FavoriteTeamKey>();

  for (const entry of value) {
    const favorite = normalizeFavoriteTeamKey(entry);

    if (favorite && !seen.has(favorite)) {
      seen.add(favorite);
      favorites.push(favorite);
    }
  }

  return favorites;
}

export function buildFavoriteTeamKey(
  league: string,
  teamId: string | number,
): FavoriteTeamKey | null {
  return normalizeFavoriteTeamKey(`${league}:${teamId}`);
}

export function splitFavoriteRailOrder(
  items: readonly FavoriteItem[],
): FavoriteRailOrder {
  const favoriteTeamIds = normalizeFavoriteTeamKeys(
    items.flatMap((item) =>
      item.kind === "team" ? [`${item.league}:${item.id}`] : [],
    ),
  );
  const favoriteSports = items.flatMap((item) =>
    item.kind === "league" ? [item.id] : [],
  );

  return {
    favoriteTeamIds,
    favoriteSports,
  };
}

export function groupFavoriteRailItems(
  items: readonly FavoriteItem[],
): FavoriteItem[] {
  return [
    ...items.filter((item) => item.kind === "league"),
    ...items.filter((item) => item.kind === "team"),
  ];
}

export function resolvePersistedFavoriteRailKeys(
  orderedKeys: readonly string[],
  previousFavoriteTeamIds: readonly FavoriteTeamKey[],
  previousFavoriteSports: readonly FavoriteSportId[],
  teamOrderSaved: boolean,
  sportOrderSaved: boolean,
): string[] {
  let previousTeamIndex = 0;
  let previousSportIndex = 0;

  return orderedKeys.map((key) => {
    if (key.startsWith("league:")) {
      const previousSport = previousFavoriteSports[previousSportIndex];
      previousSportIndex += 1;

      return sportOrderSaved || !previousSport
        ? key
        : `league:${previousSport}`;
    }

    const previousTeam = previousFavoriteTeamIds[previousTeamIndex];
    previousTeamIndex += 1;

    return teamOrderSaved || !previousTeam ? key : previousTeam;
  });
}
