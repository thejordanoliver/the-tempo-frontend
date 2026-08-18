import { getWCBBTeam, getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { getNBATeam, getTeamLogo } from "constants/teams";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getCBBTeam, getCBBTeamLogo } from "constants/teamsCBB";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import type { ImageSourcePropType } from "react-native";
import type { FavoriteLeague, FavoriteTeamItem } from "types/favorites";

export type FavoriteTeamRoute =
  | "/team/[teamId]"
  | "/team/wnba/[teamId]"
  | "/team/nfl/[teamId]"
  | "/team/cfb/[teamId]"
  | "/team/cbb/[teamId]"
  | "/team/wcbb/[teamId]"
  | "/team/mlb/[teamId]"
  | "/team/cb/[teamId]"
  | "/team/sb/[teamId]"
  | "/team/nhl/[teamId]";

export type FavoriteBaseTeam = {
  name: string;
  code?: string;
  logo?: ImageSourcePropType | null;
  color?: string | null;
};

export function getFavoriteBaseTeam(
  league: FavoriteLeague,
  teamId: string,
): FavoriteBaseTeam | undefined {
  switch (league) {
    case "NBA":
      return getNBATeam(teamId);
    case "WNBA":
      return getWNBATeam(teamId);
    case "NFL":
      return getNFLTeam(teamId);
    case "CFB":
      return getCFBTeam(teamId);
    case "CBB":
      return getCBBTeam(teamId);
    case "WCBB":
      return getWCBBTeam(teamId);
    case "MLB":
      return getMLBTeam(teamId);
    case "CB":
      return getCBTeam(teamId);
    case "SB":
      return getSBTeam(teamId);
    case "NHL":
      return getNHLTeam(teamId);
  }
}

export function getFavoriteTeamLogo(
  team: FavoriteTeamItem,
): ImageSourcePropType | null {
  const teamId = Number(team.id);

  if (!Number.isFinite(teamId)) {
    return team.logo ?? null;
  }

  switch (team.league) {
    case "NBA":
      return getTeamLogo(teamId, true);

    case "WNBA":
      return getWNBATeamLogo(teamId, true);

    case "NFL":
      return getNFLTeamLogo(teamId, true);

    case "CFB":
      return getCFBTeamLogo(teamId, true);

    case "CBB":
      return getCBBTeamLogo(teamId, true);

    case "WCBB":
      return team.logo ?? getWCBBTeamLogo(teamId, true);

    case "MLB":
      return getMLBTeamLogo(teamId, true);

    case "CB":
      return getCBTeamLogo(teamId, true);

    case "SB":
      return getSBTeamLogo(teamId, true);

    case "NHL":
      return getNHLTeamLogo(teamId, true);

    default:
      return team.logo ?? null;
  }
}

export function getFavoriteTeamRoute(
  league: FavoriteLeague,
): FavoriteTeamRoute {
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
    case "CB":
      return "/team/cb/[teamId]";
    case "SB":
      return "/team/sb/[teamId]";
    case "NHL":
      return "/team/nhl/[teamId]";
  }
}

export function isCollegeFavoriteLeague(league: FavoriteLeague): boolean {
  return (
    league === "CFB" ||
    league === "CBB" ||
    league === "WCBB" ||
    league === "CB" ||
    league === "SB"
  );
}
