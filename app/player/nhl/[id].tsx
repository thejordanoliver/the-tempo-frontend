import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import { getNHLTeam, getNHLTeamLogo } from "constants/teamsNHL";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { ScrollView } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const params = useLocalSearchParams<{
    id?: string;
    teamId?: string;
    league?: string;
  }>();

  const navigation = useNavigation();
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";

  // -------------------------
  // Params
  // -------------------------
  const playerId = params.id;
  const teamIdParam = params.teamId;
  const league = "NHL";

  const styles = playerScreenStyles;
  const numericTeamId = Number(teamIdParam);
  const team = getNHLTeam(numericTeamId);
  const teamLogo = getNHLTeamLogo(numericTeamId, true);

  // -------------------------
  // Header
  // -------------------------
  useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          teamId={numericTeamId}
          logo={teamLogo}
          teamColor={team?.color}
          onBack={() => navigation.goBack()}
          teamCode={team?.code}
          isTeamScreen
          isPlayerScreen
          league={league}
        />
      ),
    });
  }, [navigation, numericTeamId, team, league]);

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainerStyle}
    ></ScrollView>
  );
}
