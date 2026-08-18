import type { ImageSourcePropType } from "react-native";

export const FAVORITE_LEAGUES = [
  "NBA",
  "WNBA",
  "NFL",
  "CFB",
  "CBB",
  "WCBB",
  "MLB",
  "CB",
  "SB",
  "NHL",
] as const;

export type FavoriteLeague = (typeof FAVORITE_LEAGUES)[number];

export type FavoriteTeamItem = {
  id: string;
  name: string;
  code: string;
  logo?: ImageSourcePropType | null;
  color?: string;
  league: string;
  key: string;
  isDark: boolean;
};

export function isFavoriteLeague(value: string): value is FavoriteLeague {
  return (FAVORITE_LEAGUES as readonly string[]).includes(value);
}
