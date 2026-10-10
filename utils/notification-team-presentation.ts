import { getNBATeam, getTeamBySummerId } from "@/constants/teams";
import { getCBTeam } from "@/constants/teamsCB";
import { getCFBTeam, getCFBTeamByESPNId } from "@/constants/teamsCFB";
import { getMCBBTeam, getMCBBTeamByESPNId } from "@/constants/teamsMCBB";
import { getMLBTeam } from "@/constants/teamsMLB";
import { getNFLTeam, getNFLTeamByESPNId } from "@/constants/teamsNFL";
import { getNHLTeam } from "@/constants/teamsNHL";
import { getSBTeam } from "@/constants/teamsSB";
import { getSOCCTeam } from "@/constants/teamsSOCC";
import { getUFLTeam, getUFLTeamByESPNId } from "@/constants/teamsUFL";
import { getWCBBTeam, getWCBBTeamByESPNId } from "@/constants/teamsWCBB";
import { getWNBATeam, getWNBATeamByESPNId } from "@/constants/teamsWNBA";
import type { AppNotification } from "@/types/notifications";
import type { Team } from "@/types/team";
import type { ImageSource } from "expo-image";

export type NotificationTeamPresentation = {
  id: string;
  name: string;
  code: string;
  logo: ImageSource;
};

export type NotificationGameTeams = {
  away: NotificationTeamPresentation | null;
  home: NotificationTeamPresentation | null;
  matchup: string;
};

const notificationDataString = (notification: AppNotification, key: string) => {
  const value = notification.data?.[key];
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : null;
};

const resolveTeam = (
  sport: string,
  leagueInput: string,
  teamId: string,
): Team | null | undefined => {
  const league = leagueInput.toLowerCase();

  switch (league) {
    case "nba":
      return getNBATeam(teamId) ?? getNBATeam(teamId);
    case "wnba":
      return getWNBATeam(teamId) ?? getWNBATeamByESPNId(teamId);
    case "mcbb":
      return getMCBBTeam(teamId) ?? getMCBBTeamByESPNId(teamId);
    case "wcbb":
      return getWCBBTeam(teamId) ?? getWCBBTeamByESPNId(teamId);
    case "nfl":
      return getNFLTeam(teamId) ?? getNFLTeamByESPNId(teamId);
    case "cfb":
      return getCFBTeam(teamId) ?? getCFBTeamByESPNId(teamId);
    case "ufl":
      return getUFLTeam(teamId) ?? getUFLTeamByESPNId(teamId);
    case "mlb":
      return getMLBTeam(teamId) ?? getMLBTeam(teamId);
    case "cb":
    case "college-baseball":
      return getCBTeam(teamId);
    case "sb":
    case "college-softball":
      return getSBTeam(teamId);
    case "nhl":
      return getNHLTeam(teamId) ?? getNHLTeam(teamId);
    case "summerutah":
    case "summervegas":
      return (
        getTeamBySummerId(teamId) ?? getNBATeam(teamId) ?? getNBATeam(teamId)
      );
    default:
      return sport === "soccer" ? getSOCCTeam(teamId) : undefined;
  }
};

const presentTeam = (
  team: Team | null | undefined,
  isDark: boolean,
): NotificationTeamPresentation | null => {
  if (!team?.logo) return null;

  return {
    id: String(team.id),
    name: team.fullName || team.shortName || team.name,
    code: team.code || team.shortName || team.name,
    logo: (isDark ? (team.logoLight ?? team.logo) : team.logo) as ImageSource,
  };
};

export const getNotificationGameTeams = (
  notification: AppNotification,
  isDark: boolean,
): NotificationGameTeams | null => {
  if (!notification.type.startsWith("game_")) return null;

  const sport = notificationDataString(notification, "sport")?.toLowerCase();
  const league = notificationDataString(notification, "league")?.toLowerCase();
  const awayTeamId = notificationDataString(notification, "awayTeamId");
  const homeTeamId = notificationDataString(notification, "homeTeamId");
  if (!sport || !league || (!awayTeamId && !homeTeamId)) return null;

  const away = awayTeamId
    ? presentTeam(resolveTeam(sport, league, awayTeamId), isDark)
    : null;
  const home = homeTeamId
    ? presentTeam(resolveTeam(sport, league, homeTeamId), isDark)
    : null;
  if (!away && !home) return null;

  const matchup =
    away && home
      ? `${away.code} at ${home.code}`
      : (away?.code ?? home?.code ?? "");

  return { away, home, matchup };
};
