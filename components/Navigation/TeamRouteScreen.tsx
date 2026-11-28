import { CustomHeader } from "components/CustomHeader";
import BaseballTeamScreen from "components/Sports/Baseball/BaseballTeamScreen";
import BasketballTeamScreen from "components/Sports/Basketball/BasketballTeamScreen";
import FootballTeamScreen from "components/Sports/Football/FootballTeamScreen";
import HockeyTeamScreen from "components/Sports/Hockey/HockeyTeamScreen";
import SoccerTeamScreen from "components/Sports/Soccer/SoccerTeamScreen";
import { globalStyles } from "constants/styles";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { Text, View } from "react-native";
import { resolveTeamRoute } from "utils/navigation/teamNavigation";

export default function TeamRouteScreen() {
  const params = useLocalSearchParams<{
    sport?: string | string[];
    teamId?: string | string[];
    league?: string | string[];
  }>();
  const sport = Array.isArray(params.sport) ? params.sport[0] : params.sport;
  const teamId = Array.isArray(params.teamId)
    ? params.teamId[0]
    : params.teamId;
  const route = resolveTeamRoute(sport, teamId, params.league);

  if (!route || !teamId) return <UnavailableTeamScreen />;

  const key = `${route.league}:${teamId}`;

  switch (route.sport) {
    case "basketball":
      return (
        <BasketballTeamScreen key={key} teamId={teamId} league={route.league} />
      );
    case "football":
      return (
        <FootballTeamScreen key={key} teamId={teamId} league={route.league} />
      );
    case "hockey":
      return (
        <HockeyTeamScreen key={key} teamId={teamId} league={route.league} />
      );
    case "soccer":
      return (
        <SoccerTeamScreen key={key} teamId={teamId} league={route.league} />
      );
    case "baseball":
      return (
        <BaseballTeamScreen key={key} teamId={teamId} league={route.league} />
      );
  }
}

function UnavailableTeamScreen() {
  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const global = globalStyles(resolvedColorScheme === "dark");

  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeader
          title="Team unavailable"
          onBack={() => navigation.goBack()}
        />
      ),
    });
  }, [navigation]);

  return (
    <View style={global.emptyContainer}>
      <Text style={global.emptyTitle}>Team unavailable</Text>
      <Text style={global.emptySubText}>This team could not be found.</Text>
    </View>
  );
}
