import { getWCBBTeam, getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { getNBATeam, getNBATeamLogo } from "constants/teams";
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
    case "nba":
      return getNBATeam(teamId);
    case "wnba":
      return getWNBATeam(teamId);
    case "nfl":
      return getNFLTeam(teamId);
    case "cfb":
      return getCFBTeam(teamId);
    case "cbb":
      return getCBBTeam(teamId);
    case "wcbb":
      return getWCBBTeam(teamId);
    case "mlb":
      return getMLBTeam(teamId);
    case "cb":
      return getCBTeam(teamId);
    case "sb":
      return getSBTeam(teamId);
    case "nhl":
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
    case "nba":
      return getNBATeamLogo(teamId, true);

    case "wnba":
      return getWNBATeamLogo(teamId, true);

    case "nfl":
      return getNFLTeamLogo(teamId, true);

    case "cfb":
      return getCFBTeamLogo(teamId, true);

    case "cbb":
      return getCBBTeamLogo(teamId, true);

    case "wcbb":
      return team.logo ?? getWCBBTeamLogo(teamId, true);

    case "mlb":
      return getMLBTeamLogo(teamId, true);

    case "cb":
      return getCBTeamLogo(teamId, true);

    case "sb":
      return getSBTeamLogo(teamId, true);

    case "nhl":
      return getNHLTeamLogo(teamId, true);

    default:
      return team.logo ?? null;
  }
}

export function getFavoriteTeamRoute(league: string): FavoriteTeamRoute {
  switch (league) {
    case "nba":
      return "/team/[teamId]";

    case "wnba":
      return "/team/wnba/[teamId]";

    case "nfl":
      return "/team/nfl/[teamId]";

    case "cfb":
      return "/team/cfb/[teamId]";

    case "cbb":
      return "/team/cbb/[teamId]";

    case "wcbb":
      return "/team/wcbb/[teamId]";

    case "mlb":
      return "/team/mlb/[teamId]";

    case "cb":
      return "/team/cb/[teamId]";

    case "sb":
      return "/team/sb/[teamId]";

    case "nhl":
      return "/team/nhl/[teamId]";

    default:
      throw new Error(`Unsupported favorite team league: ${league}`);
  }
}

export function isCollegeFavoriteLeague(league: string): boolean {
  return (
    league === "cfb" ||
    league === "cbb" ||
    league === "wcbb" ||
    league === "cb" ||
    league === "sb"
  );
}
