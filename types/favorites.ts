import type { FavoriteSportId } from "constants/leagues";
import type { ImageSourcePropType } from "react-native";

export const FAVORITE_LEAGUES = [
  "nba",
  "wnba",
  "nfl",
  "cfb",
  "mcbb",
  "wcbb",
  "mlb",
  "cb",
  "sb",
  "mcvb",
  "wcvb",
  "nhl",
  "mch",
  "wch",
  "socc",
] as const;

export type FavoriteLeague = (typeof FAVORITE_LEAGUES)[number];
export type FavoriteTeamKey = `${FavoriteLeague}:${number}`;

type FavoriteItemBase = {
  name: string;
  color?: string;
  key: string;
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

export function isFavoriteLeague(value: string): value is FavoriteLeague {
  return (FAVORITE_LEAGUES as readonly string[]).includes(value);
}

export function normalizeFavoriteTeamKey(
  value: unknown,
): FavoriteTeamKey | null {
  if (typeof value !== "string") return null;

  const match = value.trim().match(/^([A-Za-z0-9_-]+):([0-9]+)$/);
  if (!match) return null;

  // Upgrade persisted favorites from the former men's basketball league key.
  const storedLeague = match[1].toLowerCase();
  const league = storedLeague === "cbb" ? "mcbb" : storedLeague;
  const storedTeamId = Number(match[2]);
  const teamId = storedTeamId;

  if (!isFavoriteLeague(league)) return null;
  if (!Number.isSafeInteger(teamId) || teamId <= 0) return null;

  return `${league}:${teamId}`;
}

export function normalizeFavoriteTeamKeys(value: unknown): FavoriteTeamKey[] {
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
