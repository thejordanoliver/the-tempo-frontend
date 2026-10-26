import { getNBATeam, getNBATeamLogo } from "constants/teams";
import { getCBTeam, getCBTeamLogo } from "constants/teamsCB";
import { getCFBTeam, getCFBTeamLogo } from "constants/teamsCFB";
import { getGLeagueTeam, getGLeagueTeamLogo } from "constants/teamsGLeague";
import { getMCBBTeam, getMCBBTeamLogo } from "constants/teamsMCBB";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { getNFLTeam, getNFLTeamLogo } from "constants/teamsNFL";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { getSBTeam, getSBTeamLogo } from "constants/teamsSB";
import { getSOCCTeam, getSOCCTeamLogo } from "constants/teamsSOCC";
import { getUFLTeam, getUFLTeamLogo } from "constants/teamsUFL";
import { getWCBBTeam, getWCBBTeamLogo } from "constants/teamsWCBB";
import { getWNBATeam, getWNBATeamLogo } from "constants/teamsWNBA";
import { getMCVBTeam, getMCVBTeamLogo } from "constants/teamsMCVB";
import { getWCVBTeam, getWCVBTeamLogo } from "constants/teamsWCVB";

type TeamHelpers = {
  getTeam: (id: string | number) =>
    | {
        primaryColor?: string | null;
        shortName?: string;
        name?: string;
        code?: string;
      }
    | undefined;
  getLogo: typeof getNBATeamLogo;
};

const teamHelpers: Record<string, TeamHelpers> = {
  nba: { getTeam: getNBATeam, getLogo: getNBATeamLogo },
  wnba: { getTeam: getWNBATeam, getLogo: getWNBATeamLogo },
  gleague: { getTeam: getGLeagueTeam, getLogo: getGLeagueTeamLogo },
  mcbb: { getTeam: getMCBBTeam, getLogo: getMCBBTeamLogo },
  wcbb: { getTeam: getWCBBTeam, getLogo: getWCBBTeamLogo },
  nfl: { getTeam: getNFLTeam, getLogo: getNFLTeamLogo },
  cfb: { getTeam: getCFBTeam, getLogo: getCFBTeamLogo },
  ufl: { getTeam: getUFLTeam, getLogo: getUFLTeamLogo },
  mlb: { getTeam: getMLBTeam, getLogo: getMLBTeamLogo },
  cb: { getTeam: getCBTeam, getLogo: getCBTeamLogo },
  sb: { getTeam: getSBTeam, getLogo: getSBTeamLogo },
  mcvb: { getTeam: getMCVBTeam, getLogo: getMCVBTeamLogo },
  wcvb: { getTeam: getWCVBTeam, getLogo: getWCVBTeamLogo },
  nhl: { getTeam: getNHLTeam, getLogo: getNHLTeamLogo },
};

export function getPredictionTeamHelpers(
  sport: string,
  league: string,
): TeamHelpers | undefined {
  if (sport === "mma") return undefined;
  return sport === "soccer"
    ? { getTeam: getSOCCTeam, getLogo: getSOCCTeamLogo }
    : teamHelpers[league.trim().toLowerCase()];
}
