import { LeagueType } from "types/types";


export function getTeamRoute(league: LeagueType): string {
  switch (league) {
    case "NBA":
      return "/team/nba";
    case "CBB":
      return "/team/cbb";
    case "WCBB":
      return "/team/wcbb";
    case "NFL":
      return "/team/nfl";
    case "CFB":
      return "/team/cfb";
    case "MLB":
      return "/team/mlb";
    case "NHL":
      return "/team/nhl";
    default:
      throw new Error(`Invalid league: ${league}`);
  }
}