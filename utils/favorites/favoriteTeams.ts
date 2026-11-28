import type { TabGroup } from "utils/navigation/tabStackNavigation";
import { getTeamHref, getTeamSport } from "utils/navigation/teamNavigation";
import { getWCBBTeam, getWCBBTeamLogo } from "@/constants/teamsWCBB";
import { getNBATeam, getNBATeamLogo } from "constants/teams";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getMCBBTeam, getMCBBTeamLogo } from "constants/teamsMCBB";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { getSOCCTeam, getSOCCTeamLogo } from "constants/teamsSOCC";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import type { ImageSourcePropType } from "react-native";
import type { FavoriteLeague, FavoriteTeamItem } from "types/favorites";

export type FavoriteBaseTeam = {
  name: string;
  code?: string;
  logo?: ImageSourcePropType | null;
  primaryColor?: string | null;
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
    case "mcbb":
      return getMCBBTeam(teamId);
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
    case "socc":
      return getSOCCTeam(teamId);
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

    case "mcbb":
      return getMCBBTeamLogo(teamId, true);

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

    case "socc":
      return getSOCCTeamLogo(teamId, true);

    default:
      return team.logo ?? null;
  }
}

export function getFavoriteTeamHref(
  league: string,
  teamId: string | number,
  tabGroup?: TabGroup,
) {
  if (league === "mcvb" || league === "wcvb") {
    const pathname = tabGroup
      ? (`/(tabs)/${tabGroup}/league/[sport]` as const)
      : ("/league/[sport]" as const);
    return { pathname, params: { sport: "volleyball", league } };
  }

  const sport = getTeamSport(league);
  if (!sport) throw new Error(`Unsupported favorite team league: ${league}`);
  return getTeamHref(sport, teamId, league, tabGroup);
}

export function isCollegeFavoriteLeague(league: string): boolean {
  return (
    league === "cfb" ||
    league === "mcbb" ||
    league === "wcbb" ||
    league === "cb" ||
    league === "sb" ||
    league === "mcvb" ||
    league === "wcvb" ||
    league === "mch" ||
    league === "wch"
  );
}
