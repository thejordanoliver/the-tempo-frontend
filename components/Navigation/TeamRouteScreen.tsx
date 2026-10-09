import { useLocalSearchParams } from "expo-router";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { Text, View } from "react-native";

import NBATeamScreen from "app/(tabs)/(home)/team/[teamId]";
import CBTeamScreen from "app/(tabs)/(home)/team/cb/[teamId]";
import MCBBTeamScreen from "app/(tabs)/(home)/team/mcbb/[teamId]";
import CFBTeamScreen from "app/(tabs)/(home)/team/cfb/[teamId]";
import GLeagueTeamScreen from "app/(tabs)/(home)/team/gleague/[teamId]";
import MLBTeamScreen from "app/(tabs)/(home)/team/mlb/[teamId]";
import NFLTeamScreen from "app/(tabs)/(home)/team/nfl/[teamId]";
import NHLTeamScreen from "app/(tabs)/(home)/team/nhl/[teamId]";
import SBTeamScreen from "app/(tabs)/(home)/team/sb/[teamId]";
import SoccerTeamScreen from "app/(tabs)/(home)/team/soccer/[teamId]";
import UFLTeamScreen from "app/(tabs)/(home)/team/ufl/[teamId]";
import WCBBTeamScreen from "app/(tabs)/(home)/team/wcbb/[teamId]";
import WNBATeamScreen from "app/(tabs)/(home)/team/wnba/[teamId]";

const TEAM_SCREENS = {
  nba: NBATeamScreen,
  cb: CBTeamScreen,
  mcbb: MCBBTeamScreen,
  cfb: CFBTeamScreen,
  gleague: GLeagueTeamScreen,
  mlb: MLBTeamScreen,
  nfl: NFLTeamScreen,
  nhl: NHLTeamScreen,
  sb: SBTeamScreen,
  soccer: SoccerTeamScreen,
  ufl: UFLTeamScreen,
  wcbb: WCBBTeamScreen,
  wnba: WNBATeamScreen,
} as const;

export default function TeamRouteScreen() {
  const { teamType } = useLocalSearchParams<{ teamType?: string | string[] }>();
  const { resolvedColorScheme } = usePreferences();
  const global = globalStyles(resolvedColorScheme === "dark");
  const resolvedTeamType = (Array.isArray(teamType) ? teamType[0] : teamType)?.toLowerCase() ?? "nba";
  const TeamScreen =
    TEAM_SCREENS[resolvedTeamType as keyof typeof TEAM_SCREENS];

  if (!TeamScreen) {
    return (
      <View style={global.emptyContainer}>
        <Text style={global.emptyTitle}>Team unavailable</Text>
        <Text style={global.emptySubText}>This league is not supported.</Text>
      </View>
    );
  }

  return <TeamScreen />;
}
