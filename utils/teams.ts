import { LeagueType } from "types/types";

export function getTeamRoute(league: LeagueType): string {
  switch (league) {
    case "NBA":
      return "/team/[teamId]";
    case "WNBA":
      return "/team/wnba/[teamId]";
    case "NFL":
      return "/team/nfl/[teamId]";
    case "CFB":
      return "/team/cfb/[teamId]";
    case "CBB":
      return "/team/cbb/[teamId]";
    case "WCBB":
      return "/team/wcbb/[teamId]";
    case "MLB":
      return "/team/mlb/[teamId]";
    case "NHL":
      return "/team/nhl/[teamId]";
    case "MMA":
      return "/player/mma/[id]";
    default:
      throw new Error(`Invalid league: ${league}`);
  }
}