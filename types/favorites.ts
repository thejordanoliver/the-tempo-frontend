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

export function isFavoriteLeague(value: string): value is FavoriteLeague {
  return (FAVORITE_LEAGUES as readonly string[]).includes(value);
}
