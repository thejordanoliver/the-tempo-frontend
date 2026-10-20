import { getMCVBTeam, getMCVBTeamLogo } from "constants/teamsMCVB";
import { getWCVBTeam, getWCVBTeamLogo } from "constants/teamsWCVB";
import type { VolleyballLeagueKey } from "types/volleyball/volleyball";

export const getVolleyballTeam = (id: string | number | null, league: VolleyballLeagueKey) =>
  league === "mcvb" ? getMCVBTeam(id ?? undefined) : getWCVBTeam(id ?? undefined);

export const getVolleyballTeamLogo = (id: string | number | null, league: VolleyballLeagueKey, isDark: boolean) =>
  league === "mcvb" ? getMCVBTeamLogo(id ?? undefined, isDark) : getWCVBTeamLogo(id ?? undefined, isDark);
