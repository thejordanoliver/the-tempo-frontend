import CustomActivityIndicator from "components/CustomActivityIndicator";
import { CustomHeaderTitle } from "components/CustomHeaderTitle";
import PlayerHeader from "components/Sports/MLB/Player/PlayerHeader";
import PlayerStatTable from "components/Sports/MLB/Player/PlayerStatTable";
import { globalStyles } from "constants/styles";
import { mlbTeams } from "constants/teamsMLB";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { usePlayerById } from "hooks/NFLHooks/usePlayerById";
import { useLayoutEffect } from "react";
import { ScrollView, Text, useColorScheme, View } from "react-native";
import { playerScreenStyles } from "styles/PlayerStyles/PlayerScreenStyles";

export default function PlayerDetailScreen() {
  const isDark = useColorScheme() === "dark";
  const styles = playerScreenStyles;
  const global = globalStyles(isDark);
  const { id, teamId } = useLocalSearchParams<{
    id?: string;
    teamId?: string;
  }>();

  const navigation = useNavigation();

  const playerId = Number(id);

  const sanitizedTeamId = String(teamId ?? "")
    .replace(/"/g, "")
    .trim();

  const teamObj = mlbTeams.find((t) => String(t.id) === sanitizedTeamId);

  /* -------------------------
     Fetch Player
  ------------------------- */
  const {
    player,
    loading: playerLoading,
    error: playerError,
  } = usePlayerById(playerId, "MLB");

  /* -------------------------
     Header
  ------------------------- */
  useLayoutEffect(() => {
    const isTeamAvailable = !!teamObj;
    navigation.setOptions({
      header: () => (
        <CustomHeaderTitle
          logo={
            isTeamAvailable
              ? teamObj?.logoLight || teamObj?.logo
              : require("assets/Baseball/MLB_Logos/MLB.png")
          }
          teamColor={isTeamAvailable ? teamObj?.color : "#1D428A"}
          onBack={() => navigation.goBack()}
          isTeamScreen={isTeamAvailable}
          isPlayerScreen
          league="MLB"
        />
      ),
    });
  }, [navigation, teamObj]);

  if (playerLoading || !player)
    return (
      <View style={global.emptyContainer}>
        <CustomActivityIndicator isDark={isDark} />
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
