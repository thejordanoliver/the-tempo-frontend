import { getTeamHref } from "utils/navigation/teamNavigation";
import { getUserProfileParams } from "utils/navigation/userProfileNavigation";
import type { ResultItem } from "types/explore";

export type ExploreRoute =
  | string
  | {
      pathname: string;
      params: Record<string, string | number>;
    };

export function getExploreRouteForResult(item: ResultItem): ExploreRoute {
  if (item.type === "user") {
    return {
      pathname: "/(tabs)/(explore)/user/[id]",
      params: getUserProfileParams(item.id, item),
    };
  }

  if (item.type === "team") {
    // Volleyball teams have league pages rather than individual detail pages.
    if (item.sport === "volleyball") {
      return {
        pathname: "/(tabs)/(explore)/league/[sport]",
        params: { sport: item.sport, league: item.league },
      };
    }

    return getTeamHref(item.sport, item.id, item.league, "(explore)");
  }

  return {
    pathname: "/(tabs)/(explore)/player/[sport]/[id]",
    params: {
      sport: item.sport,
      id: String(item.id),
      teamId: String(item.team?.id ?? item.team_id ?? ""),
      league: item.league,
    },
  };
}
