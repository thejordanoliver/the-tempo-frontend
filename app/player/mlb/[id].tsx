import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerHeader from "components/Sports/MLB/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/MLB/Player/PlayerStatTable";
import { globalStyles } from "constants/styles";
import { getMLBTeam, getMLBTeamLogo } from "constants/teamsMLB";
import { usePreferences } from "contexts/PreferencesContext";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePlayerById } from "hooks/FootballHooks/usePlayerById";
import { useLayoutEffect } from "react";
import { ScrollView, Text, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const { resolvedColorScheme } = usePreferences();
  const isDark = resolvedColorScheme === "dark";
  const styles = playerScreenStyles;
  const global = globalStyles(isDark);
  const { id, teamId } = useLocalSearchParams<{
    id?: string;
    teamId?: string;
  }>();
  const navigation = useNavigation();
  const playerId = Number(id);
  const {
    player,
    loading: playerLoading,
    error: playerError,
  } = usePlayerById(playerId, "MLB");

  const sanitizedTeamId = String(teamId ?? "")
    .replace(/"/g, "")
    .trim();

  const team = getMLBTeam(sanitizedTeamId);
  const teamLogo = getMLBTeamLogo(player?.team_id, true);

  /* -------------------------
     Header
  ------------------------- */
  useLayoutEffect(() => {
    const isTeamAvailable = !!team;
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={teamLogo}
          teamColor={isTeamAvailable ? team?.color : "#1D428A"}
          onBack={() => navigation.goBack()}
          isTeamScreen={isTeamAvailable}
          isPlayerScreen
          league="MLB"
        />
      ),
    });
  }, [navigation, team]);

  if (playerLoading || !player)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator />
      </View>
    );

  if (playerError || !player)
    return (
      <View style={global.emptyContainer}>
        <Text style={global.errorText}>{playerError}</Text>
      </View>
    );
  /* -------------------------
     Render
  ------------------------- */
  return (
    <ScrollView contentContainerStyle={styles.contentContainerStyle}>
      <PlayerHeader
        player={player}
        avatarUrl={player?.headshot}
        isDark={isDark}
      />

      <View style={{ marginTop: 24 }}>
        <PlayerStatTable playerId={player.id} />
      </View>
    </ScrollView>
  );
}
