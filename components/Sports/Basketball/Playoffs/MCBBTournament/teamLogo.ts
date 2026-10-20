import { getMCBBTeamLogo } from "constants/teamsMCBB";
import { getWCBBTeamLogo } from "constants/teamsWCBB";

export const getTournamentTeamLogo = (
  teamId: string | undefined,
  league: string,
  isDark: boolean,
) => {
  if (league === "wcbb") {
    return getWCBBTeamLogo(teamId, isDark);
  }

  return getMCBBTeamLogo(teamId, isDark);
};
